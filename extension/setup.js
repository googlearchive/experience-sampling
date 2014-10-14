/**
 * Experience Sampling consent page.
 */

var setupSurvey = {};  // Namespace variable
setupSurvey.CLOSE_TIME = 3000;  // Three seconds, in milliseconds
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
 * Adds the questions for the setup survey.
 * @param {Object} parentNode The DOM node to attach the surveys to.
 */
function addQuestions(parentNode) {
  var age = new FixedQuestion(
      constants.QuestionType.RADIO,
      'What is your age?',
      true,
      ['18-24', '25-34', '35-44', '45-54', '55-64', '65 or older'],
      false);
  parentNode.appendChild(age.makeDOMTree());

  var gender = new FixedQuestion(
      constants.QuestionType.CHECKBOX,
      'What is your gender?',
      true,
      ['Female', 'Male', constants.OTHER],
      false);
  parentNode.appendChild(gender.makeDOMTree());

  var source = new FixedQuestion(
      constants.QuestionType.RADIO,
      'How did you learn about this study?',
      true,
      [
        'Web advertisement',
        'Chrome blog',
        'Social media (Twitter, Facebook, Google+, etc.)',
        'Word of mouth'
      ],
      false);
  parentNode.appendChild(source.makeDOMTree());

  var source = new FixedQuestion(
      constants.QuestionType.DROPDOWN,
      'What state do you live in?',
      true,
      [
        'Alabama',
        'Alaska',
        'Arizona',
        'Arkansas',
        'California',
        'Colorado',
        'Connecticut',
        'Delaware',
        'Florida',
        'Georgia',
        'Hawaii',
        'Idaho',
        'Illinois',
        'Indiana',
        'Iowa',
        'Kansas',
        'Kentucky',
        'Louisiana',
        'Maine',
        'Maryland',
        'Massachusetts',
        'Michigan',
        'Minnesota',
        'Mississippi',
        'Missouri',
        'Montana',
        'Nebraska',
        'Nevada',
        'New Hampshire',
        'New Jersey',
        'New Mexico',
        'New York',
        'North Carolina',
        'North Dakota',
        'Ohio',
        'Oklahoma',
        'Oregon',
        'Pennsylvania',
        'Rhode Island',
        'South Carolina',
        'South Dakota',
        'Tennessee',
        'Texas',
        'Utah',
        'Vermont',
        'Virginia',
        'Washington',
        'West Virginia',
        'Wisconsin',
        'Wyoming',
        'District of Columbia',
        'Puerto Rico',
        'Guam',
        'American Samoa',
        'U.S. Virgin Islands',
        'Northern Mariana Islands'
      ],
      false);
  parentNode.appendChild(source.makeDOMTree());
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
    addQuestions($('survey-form'));
    $('survey-form').appendChild(makeSubmitButtonDOM());
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
