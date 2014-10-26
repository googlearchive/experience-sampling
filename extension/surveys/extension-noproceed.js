/**
 * Extension (didn't install) survey.
 */

/**
 * Adds the questions for the example survey.
 * @param {object} parentNode The DOM node to attach the surveys to.
 */
function addQuestions(parentNode) {
  parentNode.appendChild(commonQuestions.createChoiceQuestion(
      'Cancel', 'Add'));

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

  parentNode.appendChild(commonQuestions.createClarificationQuestion());
}

/**
 * Adds the screenshot for the survey.
 */
function setScreenshot() {
  $('example-img').src = 'screenshots/extension.png';
}
