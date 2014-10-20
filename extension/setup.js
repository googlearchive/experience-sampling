/**
 * Experience Sampling consent page.
 */

var setupSurvey = {};  // Namespace variable
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
      [
        '17 years old or younger',
        '18-24',
        '25-34',
        '35-44',
        '45-54',
        '55-64',
        '65 or older'
      ],
      constants.Randomize.NONE);
  parentNode.appendChild(age.makeDOMTree());

  var gender = new FixedQuestion(
      constants.QuestionType.CHECKBOX,
      'What is your gender?',
      true,
      [
        'Female',
        'Male',
        constants.OTHER,
        'I prefer not to answer'
      ],
      constants.Randomize.NONE);
  parentNode.appendChild(gender.makeDOMTree());

  var education = new FixedQuestion(
      constants.QuestionType.RADIO,
      'What is the highest degree or level of school that you have completed?',
      true,
      [
        'Graduate degree',
        'Bachelors degree (for example, BS, BA)',
        'Associates degree (for example, AS, AA)',
        'Some university, no degree',
        'Technical/trade school',
        'High school or equivalent',
        'Some high school',
        constants.OTHER
      ],
      constants.Randomize.NONE);
  parentNode.appendChild(education.makeDOMTree());

  var occupation = new EssayQuestion(
      constants.QuestionType.SHORT_STRING,
      'What is your occupation?',
      true);
  parentNode.appendChild(occupation.makeDOMTree());

  // TODO: Get a proper list of countries.
  var country = new FixedQuestion(
      constants.QuestionType.DROPDOWN,
      'In what country do you live?',
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
        'Georgia'
      ],
      constants.Randomize.NONE);
  parentNode.appendChild(country.makeDOMTree());

  // TODO: Make this question appear only if the U.S. is the answer to the
  // previous question.
  var state = new FixedQuestion(
      constants.QuestionType.DROPDOWN,
      'Which state?',
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
      constants.Randomize.NONE);
  parentNode.appendChild(state.makeDOMTree());

  var source = new FixedQuestion(
      constants.QuestionType.RADIO,
      'How did you learn about this study?',
      true,
      [
        'Web advertisement',
        'Chrome blog',
        'Social media (Twitter, Facebook, Google+, etc.)',
        'Word of mouth',
        constants.OTHER
      ],
      constants.Randomize.ANCHOR_LAST);
  parentNode.appendChild(source.makeDOMTree());

  var computer = new FixedQuestion(
      constants.QuestionType.RADIO,
      'What kind of computer are you using?',
      true,
      [
        'Mac',
        'Windows',
        'Linux',
        'Chromebook',
        'I don\'t know',
        constants.OTHER
      ],
      constants.Randomize.NONE);
  parentNode.appendChild(computer.makeDOMTree());

  var computerOwner = new FixedQuestion(
      constants.QuestionType.RADIO,
      'Whose computer is it?',
      true,
      [
        'Mine',
        'A friend or family member\'s',
        'My employer\'s',
        'A library\'s',
        constants.OTHER
      ],
      constants.Randomize.NONE);
  parentNode.appendChild(computerOwner.makeDOMTree());

  var antivirus = new FixedQuestion(
      constants.QuestionType.RADIO,
      'Does your computer have anti-virus software running on it?',
      true,
      [
        'Yes',
        'No',
        'I don\'t know'
      ],
      constants.Randomize.NONE);
  parentNode.appendChild(antivirus.makeDOMTree());
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
    setTimeout(window.close, constants.SURVEY_CLOSE_TIME);
  }
}

/**
 * Handles the submission of the setup survey.
 * @param {object} The submission button click event.
 */
function setupFormSubmitted(event) {
  event.preventDefault();

  // Check whether the participant is underage.
  var ageQuestion = document['survey-form']['Whatisyourage'];
  if (ageQuestion.value === '0-17yearsoldoryounger') {
    chrome.management.uninstallSelf();
    return;
  }

  setSetupStorageValue(constants.SETUP_COMPLETED);
  $('explanation').classList.add('hidden');
  $('survey-container').classList.add('hidden');
  $('thank-you').classList.remove('hidden');
  setTimeout(window.close, constants.SURVEY_CLOSE_TIME);
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
