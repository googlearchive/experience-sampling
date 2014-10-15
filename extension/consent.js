/**
 * Experience Sampling consent page.
 */

var consentForm = {};  // Namespace variable

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
 * Adds the consent question at the bottom of the consent form. This form is
 * slightly custom: it doesn't actually have a question, and the JavaScript
 * in the form submit handler expects the "Yes" and "No" responses to be in a
 * certain order.
 * @param {Object} parentNode The DOM node to attach the question to
 */
function addConsentForm(parentNode) {
  var consentQuestion = new FixedQuestion(
      constants.QuestionType.RADIO,
      'consent',  // No question.
      true,
      [
        // The "Yes" answer should come first.
        'Yes, Adrienne is a rock star',
        'No, please uninstall this extension'
      ],
      constants.Randomize.NONE);
  // Remove the unneeded question label.
  var domNode = consentQuestion.makeDOMTree();
  var framesetDiv = domNode.childNodes[0];
  var unneededLabel = framesetDiv.childNodes[0];
  framesetDiv.removeChild(unneededLabel);
  parentNode.appendChild(domNode);
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
    addConsentForm($('consent-form'));
    $('consent-form').appendChild(makeSubmitButtonDOM());
    document.forms['consent-form'].addEventListener(
        'submit', consentFormSubmitted);
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
 * Handles the submission of the consent form.
 * @param {object} The submission button click event.
 */
function consentFormSubmitted(event) {
  event.preventDefault();
  var consentRadio = document['consent-form']['consent'];
  console.log('Consent form submitted: ' + consentRadio.value);
  if (consentRadio.value.match(/^0/)) {  // YES
    setConsentStorageValue(constants.CONSENT_GRANTED);
    $('consent-form-holder').classList.add('hidden');
    window.location.href = 'surveys/setup.html';
  } else if (consentRadio.value.match(/^1/)) {  // NO
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
