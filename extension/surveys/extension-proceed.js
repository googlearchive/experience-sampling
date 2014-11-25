/**
 * Extension (did install) survey.
 */

/**
 * Adds the questions for the example survey.
 * @param {object} parentNode The DOM node to attach the surveys to.
 */
function addQuestions(parentNode) {
  addQuestion(parentNode, commonQuestions.createChoiceQuestion(
      'Add', 'Cancel'));

  var meaning = new EssayQuestion(
      constants.QuestionType.LONG_ESSAY,
      'What was the dialog trying to tell you, in your own words?',
      true);
  addQuestion(parentNode, meaning);

  var source = new EssayQuestion(
      constants.QuestionType.LONG_ESSAY,
      'Who do you think the dialog was from?',
      true);
  addQuestion(parentNode, source);

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
  addQuestion(parentNode, attributes);

  addQuestion(parentNode, commonQuestions.createClarificationQuestion());
}

/**
 * Adds the screenshot for the survey.
 */
function setScreenshot() {
  $('example-img').src = 'screenshots/extensionWin.png';
}
