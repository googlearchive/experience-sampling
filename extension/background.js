/**
 * Experience Sampling event page.
 *
 * This background page handles the various events for registering participants
 * and showing new surveys in response to API events.
 */

var cesp = {};  // namespace variable

// Settings.
cesp.notificationTitle = "New survey available";
cesp.notificationBody = "Click here to take a survey about the screen you just"
                        + "saw";
cesp.iconFile = "icon.png";
cesp.notificationDefaultTimeout = 15000;  // milliseconds

function getRegistration() {
  /**
   * Retrieves the registration status from Local Storage.
   */
  chrome.storage.local.get("isRegistered", checkOrStartRegistration);
}

function checkOrStartRegistration(items) {
  /**
   * Checks if the user is already registered. If they aren't, then it sets up
   * the Local Storage for survey responses, and triggers the consent form.
   * @param {object} items Object containing "isRegistered" status (or empty).
   */
  isRegistered = items["isRegistered"] || false;
  if (isRegistered) {
    return;
  }

  chrome.storage.local.set({'pending_responses': []}, showConsentForm());
}

function showConsentForm() {
  /**
   * Creates a new tab with the consent form page.
   */
  chrome.tabs.create({'url': chrome.extension.getURL('consent.html')},
      function() { console.log("Notice and consent displayed"); });
}

// Trigger the registration checks at install.
chrome.runtime.onInstalled.addListener(getRegistration);

function showSurveyPrompt(element, decision) {
  /**
   * Creates a new HTML5 notification to prompt the participant to take an
   * experience sampling survey.
   * @param {object} element The browser element of interest.
   * @param {object{ decision The decision the participant made.
   */
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

function loadSurvey(element, decision, timePromptShown, timePromptClicked) {
  /**
   * Creates a new tab with the experience sampling survey page.
   * @param {object} element The browser element of interest.
   * @param {object} decision The decision the participant made.
   * @param {object} timePromptShown Date object of when the survey prompt
   *     notification was shown to the participant.
   * @param {object} timePromptClicked Date object of when the participant
   *     clicked the survey prompt notification.
   */
  var surveyURL = "survey-example.html";
  chrome.tabs.create({'url': chrome.extension.getURL("surveys/" + surveyURL)},
      function() { console.log("Opened survey."); });
}

// Trigger the new survey prompt when the participant makes a decision about an
// experience sampling element.
chrome.experienceSamplingPrivate.onDecision.addListener(showSurveyPrompt);
