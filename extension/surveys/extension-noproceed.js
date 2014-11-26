/**
 * Extension (didn't install) survey.
 */

/**
 * Adds the questions for the example survey.
 * @param {object} parentNode The DOM node to attach the surveys to.
 */
function addQuestions(parentNode) {
  addQuestion(parentNode, commonQuestions.createChoiceQuestion(
      'Cancel', 'Add'));

  var meaning = new EssayQuestion(
      constants.QuestionType.LONG_ESSAY,
      'What was the dialog trying to tell you, in your own words?',
      true);
  addQuestion(parentNode, meaning);

  var source = new FixedQuestion(
      constants.QuestionType.RADIO,
      'Who was the dialog from?',
      true,
      [
        'Chrome (my browser)',
        'A hacker',
        'Windows',
        surveyDriver.questionUrl,
        constants.OTHER
      ],
      constants.Randomize.ANCHOR_LAST);
  addQuestion(parentNode, source);

  var referrer = new EssayQuestion(
      constants.QuestionType.LONG_ESSAY,
      'What led you to try to install the extension or app mentioned' +
      ' in the dialog?',
      true);
  addQuestion(parentNode, referrer);

  var attributes = new ScaleQuestion(
      constants.QuestionType.MULT_HORIZ_SCALE,
      'To what degree do each of the following adjectives describe' +
          ' the dialog?',
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

  var extensionName = new EssayQuestion(
      constants.QuestionType.LONG_ESSAY,
      'What is the name of the extension or app you were trying to install?',
      true);
  addQuestion(parentNode, extensionName);

  addQuestion(parentNode, commonQuestions.createClarificationQuestion());
}

/**
 * Adds the screenshot for the survey.
 */
function setScreenshot() {
  switch (surveyDriver.operatingSystem) {
    case constants.OS.MAC:
      $('example-img').src = 'screenshots/extension-mac.png';
      $('example-img').style.width = 'auto';
      $('example-img').style.height = 'auto';
      break;
    case constants.OS.LINUX:
      $('example-img').src = 'screenshots/extension-linux.png';
      break;
    case constants.OS.WIN:
    case constants.OS.CROS:
    default:
      $('example-img').src = 'screenshots/extension-win.png';
  }
}
