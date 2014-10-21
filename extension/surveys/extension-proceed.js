/**
 * Example survey.
 */

/**
 * Adds the questions for the example survey.
 * @param {Object} parentNode The DOM node to attach the surveys to.
 */
function addQuestions(parentNode) {
  var howChoose = new EssayQuestion(
      constants.QuestionType.LONG_ESSAY,
      'You chose "Add" instead of "Cancel."' +
          ' How did you choose between the two options?',
      true);
  parentNode.appendChild(howChoose.makeDOMTree());

  var meaning = new EssayQuestion(
      constants.QuestionType.LONG_ESSAY,
      'What was the dialog trying to tell you, in your own words?',
      true);
  parentNode.appendChild(meaning.makeDOMTree());

  var source = new EssayQuestion(
      constants.QuestionType.LONG_ESSAY,
      'Who do you think the dialog was from?',
      true);
  parentNode.appendChild(source.makeDOMTree());

  var attributes = new ScaleQuestion(
      constants.QuestionType.MULT_HORIZ_SCALE,
      'To what degree do each of the following attributes describe' +
          ' this dialog?',
      true,
      [
        'Not at all',
        'A little bit',
        'A moderate amount',
        'Very much',
        'A great deal'
      ],
      constants.Randomize.ALL);
  attributes.setAttributes(
      [
        'annoying',
        'comforting',
        'scary',
        'helpful',
        'confusing',
        'informative'
      ]);
  parentNode.appendChild(attributes.makeDOMTree());

  // TODO: Fill in real extension name!
  var extensionName = new FixedQuestion(
      constants.QuestionType.RADIO,
      'May we record the name of the extension you were trying to install, ' +
          'Google Translate, with your responses?',
      true,
      ['Yes', 'No'],
      constants.Randomize.NONE);
  parentNode.appendChild(extensionName.makeDOMTree());

  var extra = new EssayQuestion(
      constants.QuestionType.SHORT_ESSAY,
      'Please use this space to clarify any of your responses from above or ' +
          'let us know how we can improve this survey.',
      false);
  parentNode.appendChild(extra.makeDOMTree());
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
