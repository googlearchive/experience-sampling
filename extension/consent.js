/**
 * Experience Sampling consent page.
 */

var consentForm = {};  // Namespace variable

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
    $('top-blurb').classList.remove('hidden');
    $('consent-form-holder').classList.remove('hidden');
    $('give-consent').addEventListener('click', userGrantConsent);
    $('no-consent').addEventListener('click', userRejectConsent)
  } else if (consentForm.status == constants.CONSENT_GRANTED) {
    // Show the consent form and the user's decision.
    $('study-information').classList.remove('hidden');
    $('top-blurb').classList.remove('hidden');
    $('retract-consent').classList.remove('hidden');
  } else if (consentForm.status == constants.CONSENT_REJECTED) {
    // This state shouldn't be possible here because the extension should
    // already have been uninstalled. Adding this as an extra safety.
    chrome.management.uninstallSelf();
  }
}

/**
 * Handles the user giving consent.
 * @param {object} The link click event.
 */
function userGrantConsent(event) {
  console.log('Consent granted');
  setConsentStorageValue(constants.CONSENT_GRANTED);
  $('consent-form-holder').classList.add('hidden');
}

/**
 * Handles the user withdrawing consent.
 * @param {object} The link click event.
 */
function userRejectConsent(event) {
  event.preventDefault();
  console.log('Consent rejected');
  setConsentStorageValue(constants.CONSENT_REJECTED);
  $('consent-form-holder').classList.add('hidden');
  setTimeout(chrome.management.uninstallSelf);
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
