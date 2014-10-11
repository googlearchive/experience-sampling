/**
 * Experience Sampling consent page.
 */

var setupSurvey = {};  // Namespace variable
setupSurvey.CLOSE_TIME = 3000;  // Half a minute, in milliseconds
setupSurvey.status = constants.SETUP_PENDING;

/**
 * A helper method for updating the value in local storage.
 * @param {string} newState The desired new state for the setup pref.
 */
function setSetupStorageValue(newState) {
  var items = {};
  items[constants.SETUP_KEY] = newState;
  chrome.storage.local.set(items);
}

/**
 * Sets up the survey form based on the saved survey value.
 * @param {object} savedState Object possibly containing the setup status.
 */
function setupSurveyForm(savedState) {
  // Get the value from storage; save an initial value if empty.
  if (!savedState || savedState[constants.SETUP_KEY] == null) {
    setSetupStorageValue(constants.SETUP_PENDING);
  } else {
    setupSurvey.status = savedState[constants.SETUP_KEY];
  }
  console.log('Setup survey status: ' + setupSurvey.status);

  if (setupSurvey.status == constants.SETUP_PENDING) {
    // Show the survey.
    $('explanation').classList.remove('hidden');
    $('survey-container').classList.remove('hidden');
    document.forms['survey-form'].addEventListener(
        'submit', setupFormSubmitted);
  } else if (setupSurvey.status == constants.SETUP_COMPLETED) {
    // Show a notice that the survey was already completed.
    $('already-completed').classList.remove('hidden');
    setTimeout(window.close, setupSurvey.CLOSE_TIME);
  }
}

/**
 * Handles the submission of the setup survey.
 * @param {object} The submission button click event.
 */
function setupFormSubmitted(event) {
  event.preventDefault();
  setSetupStorageValue(constants.SETUP_COMPLETED);
  $('explanation').classList.add('hidden');
  $('survey-container').classList.add('hidden');
  $('thank-you').classList.remove('hidden');
  setTimeout(window.close, setupSurvey.CLOSE_TIME);
}

/**
 * Looks up values from local storage to set up the initial state. This should
 * be the first method called when the page is loaded.
 */
function getInitialState() {
  console.log('Setup survey loading');
  chrome.storage.local.get(constants.SETUP_KEY, setupSurveyForm);
}

document.addEventListener('DOMContentLoaded', getInitialState);
