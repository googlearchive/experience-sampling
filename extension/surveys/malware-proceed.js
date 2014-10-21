/**
 * Example survey.
 */

/**
 * Adds the questions for the example survey.
 * @param {Object} parentNode The DOM node to attach the surveys to.
 */
function addQuestions(parentNode) {
  var age = new FixedQuestion(
      constants.QuestionType.RADIO,
      'What is your age?',
      true,
      ['18-24', '25-34', '35-44', '45-54', '55-64', '65 or older'],
      constants.Randomize.NONE);
  parentNode.appendChild(age.makeDOMTree());

  var realAge = new FixedQuestion(
      constants.QuestionType.RADIO,
      'What is your REAL age?',
      true,
      ['18-24', '25-34', '35-44', '45-54', '55-64', '65 or older'],
      constants.Randomize.ALL);
  parentNode.appendChild(realAge.makeDOMTree());

  var gender = new FixedQuestion(
      constants.QuestionType.CHECKBOX,
      'What is your gender?',
      true,
      ['Female', 'Male', constants.OTHER],
      constants.Randomize.ANCHOR_LAST);
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
      constants.Randomize.ALL);
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
      constants.Randomize.NONE);
  parentNode.appendChild(source.makeDOMTree());

  var source = new FixedQuestion(
      constants.QuestionType.DROPDOWN,
      'Are these states randomized?',
      false,
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
      constants.Randomize.ALL);
  parentNode.appendChild(source.makeDOMTree());

  var pinaColadas = new EssayQuestion(
      constants.QuestionType.SHORT_STRING,
      'How much do you like pina coladas?',
      true);
  parentNode.appendChild(pinaColadas.makeDOMTree());

  var pinaColadasDetails = new EssayQuestion(
      constants.QuestionType.SHORT_ESSAY,
      'What is your favorite thing about pina coladas?',
      true);
  parentNode.appendChild(pinaColadasDetails.makeDOMTree());

  var pinaColadasEssay = new EssayQuestion(
      constants.QuestionType.LONG_ESSAY,
      'Please compare and contrast pina coladas and mimosas.',
      false);
  parentNode.appendChild(pinaColadasEssay.makeDOMTree());

  var hungry = new ScaleQuestion(
      constants.QuestionType.VERTICAL_SCALE,
      'How hungry are you?',
      false,
      ['I want to eat my hands', '', 'Medium', '', 'I hate food'],
      constants.Randomize.ALL);
  parentNode.appendChild(hungry.makeDOMTree());

  var pizza = new ScaleQuestion(
      constants.QuestionType.VERTICAL_SCALE,
      'How delicious is pizza?',
      false,
      ['The best', '', 'Medium', '', 'Still pretty good', 'Mmm'],
      constants.Randomize.ANCHOR_LAST);
  parentNode.appendChild(pizza.makeDOMTree());

  var adrienne = new ScaleQuestion(
      constants.QuestionType.HORIZ_SCALE,
      'How awesome is Adrienne?',
      true,
      ['Super duper', '', 'Blazing', '', 'Fantastical'],
      constants.Randomize.ALL);
  parentNode.appendChild(adrienne.makeDOMTree());

  var kittens = new ScaleQuestion(
      constants.QuestionType.MULT_HORIZ_SCALE,
      'Wine is delicious.',
      false,
      ['Agree', '', '', '', 'Disagree'],
      constants.Randomize.ALL);
  kittens.setAttributes(['Red wine', 'White wine', 'Champagne']);
  parentNode.appendChild(kittens.makeDOMTree());
}

/**
 * Sets up the survey form.
 */
function setupSurvey() {
  console.log('Setting up a survey');
  $('explanation').classList.remove('hidden');
  $('survey-container').classList.remove('hidden');
  addQuestions($('survey-form'));
  $('survey-form').appendChild(makeSubmitButtonDOM());
  document.forms['survey-form'].addEventListener(
      'submit', setupFormSubmitted);
}

/**
 * Handles the submission of the setup survey.
 * @param {object} The submission button click event.
 */
function setupFormSubmitted(event) {
  console.log('Survey submitted');
  event.preventDefault();
  $('explanation').classList.add('hidden');
  $('survey-container').classList.add('hidden');
  $('thank-you').classList.remove('hidden');
  setTimeout(window.close, constants.SURVEY_CLOSE_TIME);
}

document.addEventListener('DOMContentLoaded', setupSurvey);
