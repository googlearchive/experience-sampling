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

cesp.operatingSystem = "";

// Settings.
cesp.SERVER_URL = 'https://chrome-experience-sampling.appspot.com';
cesp.SUBMIT_SURVEY_ACTION = '/_ah/api/cesp/v1/submitsurvey';
cesp.XHR_TIMEOUT = 4000;
cesp.NOTIFICATION_TITLE = 'New Chrome survey available!';
cesp.NOTIFICATION_BODY = 'Your feedback makes Chrome better.';
cesp.NOTIFICATION_BUTTON = 'Take survey!';
cesp.NOTIFICATION_CONSENT_LINK = 'What is this?';
cesp.MAX_SURVEYS_PER_DAY = 2;
cesp.ICON_FILE = 'icon.png';
cesp.NOTIFICATION_DEFAULT_TIMEOUT = 10;  // minutes
cesp.NOTIFICATION_TAG = 'chromeSurvey';
cesp.SURVEY_COUNT_RESET_ALARM_NAME = 'surveyCountReset';
cesp.NOTIFICATION_ALARM_NAME = 'notificationTimeout';
cesp.UNINSTALL_ALARM_NAME = 'uninstallAlarm';
cesp.READY_FOR_SURVEYS = 'readyForSurveys';

// SETUP

/**
 * A helper method for updating the value in local storage.
 * @param {bool} newState The desired new state for the ready for surveys flag.
 */
function setReadyForSurveysStorageValue(newState) {
  var items = {};
  items[cesp.READY_FOR_SURVEYS] = newState;
  chrome.storage.local.set(items);
}

/**
 * A helper method for updating the value in local storage.
 * @param {int} newCount The desired new survey count value.
 */
function setSurveysShownStorageValue(newCount) {
  var items = {};
  items[cesp.SURVEYS_SHOWN_TODAY] = newCount;
  chrome.storage.local.set(items);
}

/**
 * Sets up basic state for the extension. Called when extension is installed.
 * @param {object} details The details of the chrome.runtime.onInstalled event.
 */
function setupState(details) {
  // We check the event reason because onInstalled can trigger for other
  // reasons (extension or browser update).
  if (details.reason === 'install') {
    setReadyForSurveysStorageValue(false);
    chrome.storage.local.set({'pending_responses': []});
    chrome.runtime.getPlatformInfo(function(platformInfo) {
      cesp.operatingSystem = platformInfo.os;
    });
    // Automatically uninstall the extension after 120 days.
    chrome.alarms.create(cesp.UNINSTALL_ALARM_NAME, {delayInMinutes: 172800});
    // Set the count of surveys shown to 0, and reset it each day at midnight.
    setSurveysShownStorageValue(0);
    var midnight = new Date();
    midnight.setHours(0, 0, 0, 0);
    // Midnight is the last midnight, so we set the alarm for one day from it.
    chrome.alarms.create(cesp.SURVEY_THROTTLE_RESET_ALARM,
        {when: midnight.getTime() + 86400000, periodInMinutes: 1440});
  }
}

/**
 * Handles the uninstall alarm.
 * @param {Alarm} alarm The alarm object from the onAlarm event.
*/
function handleUninstallAlarm(alarm) {
  if (alarm.name === cesp.UNINSTALL_ALARM_NAME)
    chrome.management.uninstallSelf();
}
chrome.alarms.onAlarm.addListener(handleUninstallAlarm);

/**
 * Resets the count of surveys shown to 0.
 * @param {Alarm} alarm The alarm object from the onAlarm event.
 */
function resetSurveyCount(alarm) {
  if (alarm.name === cesp.SURVEY_THROTTLE_RESET_ALARM)
    setSurveysShownStorageValue(0);
}
chrome.alarms.onAlarm.addListener(resetSurveyCount);

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
 * @param {object} setupLookup Object containing setup survey status (or empty).
 */
function maybeShowSetupSurvey(setupLookup) {
  if (!setupLookup || setupLookup[constants.SETUP_KEY] == null ||
      setupLookup[constants.SETUP_KEY] == constants.SETUP_PENDING) {
    chrome.tabs.create({'url': chrome.extension.getURL('surveys/setup.html')});
  } else if (setupLookup[constants.SETUP_KEY] == constants.SETUP_COMPLETED) {
    setReadyForSurveysStorageValue(true);
  }
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
    setReadyForSurveysStorageValue(true);
  }
}

// Performs consent and registration checks on startup and install.
chrome.runtime.onInstalled.addListener(getConsentStatus);
chrome.runtime.onStartup.addListener(getConsentStatus);
chrome.runtime.onInstalled.addListener(setupState);

// SURVEY HANDLING

/**
 * Clears our existing notification(s).
 * @param {Alarm} alarm The alarm object from the onAlarm event (optional).
 */
function clearNotifications(alarm) {
  if (alarm && alarm.name !== cesp.NOTIFICATION_ALARM_NAME)
    return;
  chrome.notifications.clear(cesp.NOTIFICATION_TAG, function(unused) {});
  chrome.alarms.clear(cesp.NOTIFICATION_ALARM_NAME);
}
// Clear the notification state when the survey times out.
chrome.alarms.onAlarm.addListener(clearNotifications);


/**
 * Creates a new notification to prompt the participant to take an experience
 * sampling survey.
 * @param {object} element The browser element of interest.
 * @param {object} decision The decision the participant made.
 */
function showSurveyNotification(element, decision) {
  chrome.storage.local.get(cesp.READY_FOR_SURVEYS, function(items) {
    if (!items[cesp.READY_FOR_SURVEYS]) return;

    chrome.storage.local.get(cesp.SURVEYS_SHOWN_TODAY, function(items) {
      if (items[cesp.SURVEYS_SHOWN_TODAY] >= cesp.MAX_SURVEYS_PER_DAY) {
        return;
      }

      clearNotifications();

      var timePromptShown = new Date();
      var clickHandler = function(notificationId, buttonIndex) {
        if (buttonIndex === 1) {
          chrome.tabs.create({'url': chrome.extension.getURL('consent.html')});
        } else {
          var timePromptClicked = new Date();
          loadSurvey(element, decision, timePromptShown, timePromptClicked);
          clearNotifications();
        }
      };
      var opt = {
        type: 'basic',
        iconUrl: cesp.ICON_FILE,
        title: cesp.NOTIFICATION_TITLE,
        message: cesp.NOTIFICATION_BODY,
        eventTime: Date.now(),
        buttons: [
          {title: cesp.NOTIFICATION_BUTTON},
          {title: cesp.NOTIFICATION_CONSENT_LINK}
        ],
        isClickable: true
      };
      chrome.notifications.create(
          cesp.NOTIFICATION_TAG,
          opt,
          function(id) {
            chrome.alarms.create(
                cesp.NOTIFICATION_ALARM_NAME,
                {delayInMinutes: cesp.NOTIFICATION_DEFAULT_TIMEOUT});
          });
      chrome.notifications.onClicked.addListener(clickHandler);
      chrome.notifications.onButtonClicked.addListener(clickHandler);
      setSurveysShownStorageValue(items[cesp.SURVEYS_SHOWN_TODAY] + 1);
    });
  });
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
  chrome.storage.local.get(cesp.READY_FOR_SURVEYS, function(items) {
    if (!items[cesp.READY_FOR_SURVEYS]) return;
    var userDecision = decision['name'];
    if (userDecision !== constants.DecisionType.PROCEED &&
        userDecision !== constants.DecisionType.DENY) {
      return;
    }

    var surveyLocations = {
      SSL_OVERRIDABLE_PROCEED: 'ssl-overridable-proceed.html',
      SSL_OVERRIDABLE_NOPROCEED: 'ssl-overridable-noproceed.html',
      SSL_NONOVERRIDABLE: 'ssl-nonoverridable.html',
      MALWARE_PROCEED: 'malware-proceed.html',
      MALWARE_NOPROCEED: 'malware-noproceed.html',
      PHISHING_PROCEED: 'phishing-proceed.html',
      PHISHING_NOPROCEED: 'phishing-noproceed.html',
      EXTENSION_PROCEED: 'extension-proceed.html',
      EXTENSION_NOPROCEED: 'extension-noproceed.html'
    };
    var surveyURL;
    var eventType = constants.FindEventType(element['name']);
    switch (eventType) {
      case constants.EventType.SSL_OVERRIDABLE:
        surveyURL = userDecision === constants.DecisionType.PROCEED ?
            surveyLocations.SSL_OVERRIDABLE_PROCEED :
            surveyLocations.SSL_OVERRIDABLE_NOPROCEED;
        break;
      case constants.EventType.SSL_NONOVERRIDABLE:
        surveyURL = surveyLocations.SSL_NONOVERRIDABLE;
        break;
      case constants.EventType.MALWARE:
        surveyURL = userDecision === constants.DecisionType.PROCEED ?
            surveyLocations.MALWARE_PROCEED :
            surveyLocations.MALWARE_NOPROCEED;
        break;
      case constants.EventType.PHISHING:
        surveyURL = userDecision === constants.DecisionType.PROCEED ?
            surveyLocations.PHISHING_PROCEED :
            surveyLocations.PHISHING_NOPROCEED;
        break;
      case constants.EventType.EXTENSION_INSTALL:
        surveyURL = userDecision === constants.DecisionType.PROCEED ?
            surveyLocations.EXTENSION_PROCEED :
            surveyLocations.EXTENSION_NOPROCEED;
        break;
      case constants.EventType.HARMFUL:
      case constants.EventType.SB_OTHER:
      case constants.EventType.DOWNLOAD_MALICIOUS:
      case constants.EventType.DOWNLOAD_DANGEROUS:
      case constants.EventType.DOWNLOAD_DANGER_PROMPT:
        // Don't survey about these.
        return;
      case constants.EventType.UNKNOWN:
        throw new Error('Unknown event type: ' + element['name']);
        break;
    }
    chrome.tabs.create(
        {'url': chrome.extension.getURL('surveys/' + surveyURL)},
        function() { console.log('Opened survey.'); });
  });
}

// Trigger the new survey prompt when the participant makes a decision about an
// experience sampling element.
chrome.experienceSamplingPrivate.onDecision.addListener(showSurveyNotification);

/**
 * A survey response (question and answer).
 * @constructor
 * @param {string} question The question being answered.
 * @param {string} answer The answer to that question.
 */
function Response(question, answer) {
  this.question = question;
  this.answer = answer;
}

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
}

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
  var url = cesp.SERVER_URL + cesp.SUBMIT_SURVEY_ACTION;
  var method = "POST";
  var dateTaken = survey.dateTaken.toISOString();
  // Get rid of timezone "Z" on end of ISO String for AppEngine compatibility.
  if (dateTaken.slice(-1) === "Z") {
    dateTaken = dateTaken.slice(0, -1);
  }
  var data = {
    "date_taken": dateTaken,
    "participant_id": survey.participantId,
    "responses": [],
    "survey_type": survey.type
  };
  for (var i = 0; i < survey.responses.length; i++) {
    data.responses.push(survey.responses[i]);
  }
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
