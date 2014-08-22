/* Experience Sampling event page.
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

// Handle checking registration status and displaying consent.
function getRegistration() {
  chrome.storage.local.get("isRegistered", checkRegistration);
}

function checkRegistration(items) {
  isRegistered = items["isRegistered"] || false;
  if (isRegistered) {
    return;
  }

  // Setup LocalStorage for survey responses.
  chrome.storage.local.set({'pending_responses': []}, showConsentForm());
}

function showConsentForm() {
  // Show on-install participant consent form in a new tab.
  chrome.tabs.create({'url': chrome.extension.getURL('consent.html')},
      function() { console.log("Notice and consent displayed"); });
}

chrome.runtime.onInstalled.addListener(getRegistration);

// Handle Experience Sampling events.

function showSurveyPrompt(element, decision) {
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
  var surveyURL = "survey-example.html";
  chrome.tabs.create({'url': chrome.extension.getURL("surveys/" + surveyURL)},
      function() { console.log("Opened survey."); });
}

chrome.experienceSamplingPrivate.onDecision.addListener(showSurveyPrompt);
