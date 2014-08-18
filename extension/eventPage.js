/**
 * @fileoverview Event Page to track the various extension lifecycle and
 * experience sampling events we are monitoring.
 */

/*
 * SETUP
 * Note that this event fires:
 *  - When extension is first installed
 *  - When extension is updated
 *  - When Chrome is update
 * We need to (if user is not "registered"):
 *  - Show the user the notice & consent form
 *  - If they consent, show the demographics form. If they complete the
 *  demographics form, mark them as "registered".
 *  - If they don't consent, trigger an uninstall when they hit "Submit" or
 *  "Cancel".
 */
chrome.runtime.onInstalled.addListener(function() {
  // Load our registration status from LocalStorage.
  //
  var isRegistered = false;
  chrome.storage.local.get("isRegistered", function (items) { isRegistered = items["isRegistered"] });
  
  if isRegistered {
    return;
  }
  
  // Setup LocalStorage for survey responses
  
  // Show on-install participant registration form
});

// Listen for browser event to trigger popup
chrome.experienceSamplingPrivate.onDecision.addListener(function(element, decision) {
  console.log("Experience Sampling Decision");
  console.log(element);
  console.log(decision);
  
  // Get browser version and variations
  console.log("Chrome version: " + navigator.userAgent);
  chrome.experienceSamplingPrivate.getBrowserInfo(function(info) {
    console.log("Chrome trials: " + info.variations);
  });
  
});

function showSurveyPrompt() {
  var opt = {body: 'Click here to take a survey about the screen you just saw',
             icon: 'icon.png',
             tag: 'test'};
             
  var notification = new window.Notification('New survey available', opt);
  notification.onshow = function() { setTimeout(notification.close, 15000); };
  notification.onclick = function() { loadSurvey(); };
}

function loadSurvey() {
  window.open(
}
