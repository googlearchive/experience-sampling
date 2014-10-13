/**
 * Experience Sampling event page.
 *
 * This background page handles the various events for registering participants
 * and showing new surveys in response to API events.
 *
 * Participants must fill out both a consent form and a startup survey (with
 * demographics) before they can begin to answer real survey questions.
 */

var cesp = {};  // namespace variable

cesp.readyForSurveys = false;

// Settings.
cesp.SERVER_URL = "https://chrome-experience-sampling.appspot.com";
cesp.SUBMIT_SURVEY_ACTION = "/_ah/api/cesp/v1/submitsurvey";
cesp.XHR_TIMEOUT = 4000;
cesp.notificationTitle = "New survey available";
cesp.notificationBody = "Click here to take a survey about the screen you just"
                        + "saw";
cesp.iconFile = "icon.png";
cesp.notificationDefaultTimeout = 15000;  // milliseconds

/**
 * Retrieves the registration status from Local Storage.
 */
function getConsentStatus() {
  chrome.storage.local.get(constants.CONSENT_KEY, maybeShowConsentForm);
}

/**
 * Checks whether consent has been granted yet; if not, opens the consent form.
 * @param {object} consentLookup Object containing consent status (or empty).
 */
function maybeShowConsentForm(consentLookup) {
  if (!consentLookup || consentLookup[constants.CONSENT_KEY] == null ||
      consentLookup[constants.CONSENT_KEY] == constants.CONSENT_PENDING) {
    chrome.storage.local.set({'pending_responses': []});
    chrome.storage.onChanged.addListener(storageUpdated);
    chrome.tabs.create({'url': chrome.extension.getURL('consent.html')});
  } else if (consentLookup[constants.CONSENT_KEY] ==
             constants.CONSENT_REJECTED) {
    chrome.management.uninstallSelf();
  } else if (consentLookup[constants.CONSENT_KEY] ==
             constants.CONSENT_GRANTED) {
    // Someone might have filled out the consent form previously but not
    // filled out the setup survey. Check to see if that's the case.
    chrome.storage.local.get(constants.SETUP_KEY, maybeShowSetupSurvey);
  }
}

/**
 * Checks whether the setup survey has been completed yet. If it has been, we
 * are now ready to start showing surveys. If not, we need to listen for
 * when it's completed.
 * @param {object} surveyLookup Object containing survey status (or empty).
 */
function maybeShowSetupSurvey(surveyLookup) {
  // TODO(felt): Do this check for real.
  cesp.readyForSurveys = true;
}

/**
 * Listens for the setup survey submission. When that happens, signals that
 * the experience sampling is now ready to begin.
 * @param {object} changes The changed portions of the database.
 * @param {string} areaName The name of the storage area.
 */
function storageUpdated(changes, areaName) {
  if (changes && changes[constants.SETUP_KEY] &&
      changes[constants.SETUP_KEY].newValue == constants.SETUP_COMPLETED) {
    cesp.readyForSurveys = true;
  }
}

// Performs consent and registration checks on startup and install.
chrome.runtime.onInstalled.addListener(getConsentStatus);
chrome.runtime.onStartup.addListener(getConsentStatus);

/**
 * Creates a new HTML5 notification to prompt the participant to take an
 * experience sampling survey.
 * @param {object} element The browser element of interest.
 * @param {object} decision The decision the participant made.
 */
function showSurveyPrompt(element, decision) {
  if (!cesp.readyForSurveys) return;
  var timePromptShown = new Date();
  var opt = {body: cesp.notificationTitle,
             icon: cesp.iconFile,
             tag: cesp.notificationTag};
  var notification = new window.Notification(cesp.notificationTitle, opt);
  notification.onshow = function() {
    setTimeout(notification.close, cesp.notificationDefaultTimeout);
  };
  notification.onclick = function() {
    var timePromptClicked = new Date();
    loadSurvey(element, decision, timePromptShown, timePromptClicked);
  };
}

/**
 * Creates a new tab with the experience sampling survey page.
 * @param {object} element The browser element of interest.
 * @param {object} decision The decision the participant made.
 * @param {object} timePromptShown Date object of when the survey prompt
 *     notification was shown to the participant.
 * @param {object} timePromptClicked Date object of when the participant
 *     clicked the survey prompt notification.
 */
function loadSurvey(element, decision, timePromptShown, timePromptClicked) {
  if (!cesp.readyForSurveys) return;
  var surveyURL = "survey-example.html";
  chrome.tabs.create({'url': chrome.extension.getURL("surveys/" + surveyURL)},
      function() { console.log("Opened survey."); });
}

// Trigger the new survey prompt when the participant makes a decision about an
// experience sampling element.
chrome.experienceSamplingPrivate.onDecision.addListener(showSurveyPrompt);

/**
 * A survey response (question and answer).
 * @constructor
 * @param {string} question The question being answered.
 * @param {string} answer The answer to that question.
 */
function Response(question, answer) {
  this.question = question;
  this.answer = answer;
};

/**
 * A completed survey.
 * @constructor
 * @param {string} type The type of survey.
 * @param {int} participantId The participant ID.
 * @param {Date} dateTaken The date and time when the survey was taken.
 * @param {Array.Response} responses An array of Response objects.
*/
function Survey(type, participantId, dateTaken, responses) {
  this.type = type;
  this.participantId = participantId;
  this.dateTaken = dateTaken;
  this.responses = responses;
};

/**
 * Sends a survey to the CESP backend via XHR.
 * @param {Survey} survey The completed survey to send to the backend.
 * @param {function(string)} successCallback A function to call on receiving a
 *     successful response (HTTP 204). It should look like
 *     "function(response) {...};" where "response" is the text of the response
 *     (if there is any).
 * @param {function(!number=)} errorCallback A function to call on receiving an
 *     error from the server, or on timing out. It should look like
 *     "function(status) {...};" where "status" is an HTTP status code integer,
 *     if there is one. For a timeout, there is no status.
 */
function sendSurvey(survey, successCallback, errorCallback) {
  var url = cesp.serverURL + cesp.SUBMIT_SURVEY_ACTION;
  var method = "POST";
  var dateTaken = survey.dateTaken.toISOString();
  // Get rid of timezone "Z" on end of ISO String for AppEngine compatibility.
  if (dateTaken.slice(-1) === "Z") {
    dateTaken = dateTaken.slice(0, -1);
  };
  var data = {
    "date_taken": dateTaken,
    "participant_id": survey.participantId,
    "responses": [],
    "survey_type": survey.type
  };
  for (i in survey.responses) {
    data.responses.push(survey.responses[i]);
  };
  var xhr = new XMLHttpRequest();
  function onLoadHandler(event) {
    if (xhr.readyState === 4) {
      if (xhr.status === 204) {
        successCallback(xhr.response);
      } else {
        errorCallback(xhr.status);
      }
    }
  }
  function onErrorHandler(event) {
    errorCallback(xhr.status);
  }
  function onTimeoutHandler(event) {
    errorCallback();
  }
  xhr.open(method, url, true);
  xhr.setRequestHeader('Content-Type', 'application/JSON');
  xhr.timeout = cesp.XHR_TIMEOUT;
  xhr.onload = onLoadHandler;
  xhr.onerror = onErrorHandler;
  xhr.ontimeout = onTimeoutHandler;
  xhr.send(JSON.stringify(data));
}
