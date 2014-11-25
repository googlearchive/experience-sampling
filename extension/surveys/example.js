/**
 * Example survey.
 */

/**
 * Adds the questions for the example survey.
 * @param {object} parentNode The DOM node to attach the surveys to.
 */
function addQuestions(parentNode) {
  var age = new FixedQuestion(
      constants.QuestionType.RADIO,
      'What is your age?',
      true,
      ['18-24', '25-34', '35-44', '45-54', '55-64', '65 or older'],
      constants.Randomize.NONE);
  addQuestion(parentNode, age);

  var realAge = new FixedQuestion(
      constants.QuestionType.RADIO,
      'What is your REAL age?',
      true,
      ['18-24', '25-34', '35-44', '45-54', '55-64', '65 or older'],
      constants.Randomize.ALL);
  addQuestion(parentNode, realAge);

  var gender = new FixedQuestion(
      constants.QuestionType.CHECKBOX,
      'What is your gender?',
      true,
      ['Female', 'Male', constants.OTHER],
      constants.Randomize.ANCHOR_LAST);
  addQuestion(parentNode, gender);

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
  addQuestion(parentNode, source);

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
  addQuestion(parentNode, source);

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
  addQuestion(parentNode, source);

  var pinaColadas = new EssayQuestion(
      constants.QuestionType.SHORT_STRING,
      'How much do you like pina coladas?',
      true);
  addQuestion(parentNode, pinaColadas);

  var pinaColadasDetails = new EssayQuestion(
      constants.QuestionType.SHORT_ESSAY,
      'What is your favorite thing about pina coladas?',
      true);
  addQuestion(parentNode, pinaColadasDetails);

  var pinaColadasEssay = new EssayQuestion(
      constants.QuestionType.LONG_ESSAY,
      'Please compare and contrast pina coladas and mimosas.',
      false);
  addQuestion(parentNode, pinaColadasEssay);

  var hungry = new ScaleQuestion(
      constants.QuestionType.VERTICAL_SCALE,
      'How hungry are you?',
      false,
      ['I want to eat my hands', '', 'Medium', '', 'I hate food'],
      constants.Randomize.ALL);
  addQuestion(parentNode, hungry);

  var pizza = new ScaleQuestion(
      constants.QuestionType.VERTICAL_SCALE,
      'How delicious is pizza?',
      false,
      ['The best', '', 'Medium', '', 'Still pretty good', 'Mmm'],
      constants.Randomize.ANCHOR_LAST);
  addQuestion(parentNode, pizza);

  var adrienne = new ScaleQuestion(
      constants.QuestionType.HORIZ_SCALE,
      'How awesome is Adrienne?',
      true,
      ['Super duper', '', 'Blazing', '', 'Fantastical'],
      constants.Randomize.ALL);
  addQuestion(parentNode, adrienne);

  var kittens = new ScaleQuestion(
      constants.QuestionType.MULT_HORIZ_SCALE,
      'Wine is delicious.',
      false,
      ['Agree', '', '', '', 'Disagree'],
      constants.Randomize.ALL);
  kittens.setAttributes(['Red wine', 'White wine', 'Champagne']);
  addQuestion(parentNode, kittens);
}

/**
 * Adds the screenshot for the survey.
 */
function setScreenshot() {
  $('example-img').src = 'screenshots/ssl.png';
}
