/**
 * Experience Sampling consent page.
 */

var consentForm = {};  // Namespace variable

consentForm.CLOSE_TIME =      3600;  // Milliseconds
consentForm.UNINSTALL_TIME =  200;   // Milliseconds

consentForm.status = constants.CONSENT_PENDING;

/**
 * A helper method for updating the value in local storage.
 * @param {string} newState The desired new state for the consent pref.
 */
function setConsentStorageValue(newState) {
  var items = {};
  items[constants.CONSENT_KEY] = newState;
  chrome.storage.local.set(items);
}

/**
 * Sets up the consent form based on the saved consent value.
 * @param {object} savedState Object possibly containing the consent status.
 */
function setupConsentForm(savedState) {
  // Get the value from storage; save an initial value if empty.
  if (!savedState || savedState[constants.CONSENT_KEY] == null) {
    setConsentStorageValue(constants.CONSENT_PENDING);
  } else {
    consentForm.status = savedState[constants.CONSENT_KEY];
  }
  console.log('Consent status: ' + consentForm.status);

  if (consentForm.status == constants.CONSENT_PENDING) {
    // Show the full consent form.
    $('study-information').classList.remove('hidden');
    $('consent-form-holder').classList.remove('hidden');
    $('submit-button').addEventListener('click', consentFormSubmitted);
  } else if (consentForm.status == constants.CONSENT_GRANTED) {
    // Show the consent form and the user's decision.
    $('study-information').classList.remove('hidden');
    $('retract-consent').classList.remove('hidden');
  } else if (consentForm.status == constants.CONSENT_REJECTED) {
    // This state shouldn't be possible here because the extension should
    // already have been uninstalled. Adding this as an extra safety.
    chrome.management.uninstallSelf();
  }
}

/**
 * Handles the submission of the consent form.
 * @param {object} The submission button click event.
 */
function consentFormSubmitted(event) {
  event.preventDefault();
  var consentRadio = document['consent-form']['consent'];
  console.log('Consent form submitted: ' + consentRadio.value);
  if (consentRadio.value == 'yes') {
    setConsentStorageValue(constants.CONSENT_GRANTED);
    $('thank-you').classList.remove('hidden');
    $('consent-form-holder').classList.add('hidden');
    setTimeout(window.close, consentForm.CLOSE_TIME);
    // TODO(felt): Remove the SETUP stuff. Just here because the setup survey
    // isn't implemented yet.
    var items = {};
    items[constants.SETUP_KEY] = constants.SETUP_COMPLETED;
    chrome.storage.local.set(items);
  } else if (consentRadio.value == 'no') {
    setConsentStorageValue(constants.CONSENT_REJECTED);
    $('consent-form-holder').classList.add('hidden');
    // It's unpleasant to close the window too fast after clicking the
    // button. This adds a just-barely-perceptible delay.
    setTimeout(chrome.management.uninstallSelf, consentForm.UNINSTALL_TIME);
  } else {
    $('set-value').classList.remove('hidden');
  }
}

/**
 * Looks up values from local storage to set up the initial state. This should
 * be the first method called when the page is loaded.
 */
function getInitialState() {
  console.log('Consent page loading');
  chrome.storage.local.get(constants.CONSENT_KEY, setupConsentForm);
}

document.addEventListener('DOMContentLoaded', getInitialState);
