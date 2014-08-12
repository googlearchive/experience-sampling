/**
 * @fileoverview Description of this file.
 */


var getSurveysInterval = 10.0; // 10 minutes
var submitResponsesInterval = 5.0; // 5 minutes

/*
 * SETUP
 * Note that this fires:
 *  - When extension is first installed
 *  - When extension is updated
 *  - When Chrome is update
 * So we need to log that a user has registered to avoid prompting them multiple
 * times :-)
 */
chrome.runtime.onInstalled.addListener(function() {
  console.log("Installed.");
  
  // Setup LocalStorage for survey responses
  
  // Show on-install participant registration form
  var opt = {body: 'Please take a survey about the screen you just saw',
             icon: 'icon.png',
             tag: 'test'};
             
  var notification = new window.Notification('New survey available', opt);
  notification.onshow = function() { setTimeout(notification.close, 15000); };
  //notification.onclick = function() { loadRegistration(); };
  //notification.show();
  
  // Get browser version and variations
  console.log("Chrome version: " + navigator.userAgent);
  chrome.experienceSamplingPrivate.getBrowserInfo(function(info) {
    console.log("Chrome trials: " + info.variations);
  });

});

// Listen for browser event to trigger popup
chrome.experienceSamplingPrivate.onDecision.addListener(function(element, decision) {
  console.log("Experience Sampling Decision");
  console.log("----------------");
  console.log(element);
  console.log(decision);
  console.log("----------------");
});
