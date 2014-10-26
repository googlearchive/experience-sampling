/**
 * Defines common questions that are repeated across surveys.
 */

var commonQuestions = {};

/**
 * How did you choose between the two options?
 * @param {string} The option that the user chose.
 * @param {string} The option that the user didn't choose.
 * @returns {object} The DOM subtree with the question.
 */
commonQuestions.createChoiceQuestion = function(chosen, alternative) {
  var howChoose = new EssayQuestion(
      constants.QuestionType.LONG_ESSAY,
      'You chose "' + chosen + '" instead of "' + alternative + '."' +
          ' How did you choose between the two options?',
      true);
  return howChoose.makeDOMTree();
};

/**
 * What was the page trying to tell you?
 * @returns {object} The DOM subtree with the question.
 */
commonQuestions.createPageMeaningQuestion = function() {
  var meaning = new EssayQuestion(
      constants.QuestionType.LONG_ESSAY,
      'What was the page trying to tell you, in your own words?',
      true);
  return meaning.makeDOMTree();
};

/**
 * Who was the page from?
 * @returns {object} The DOM subtree with the question.
 */
// TODO: FILL IN CORRECT WEBSITE NAME!
commonQuestions.createPageSourceQuestion = function() {
  var source = new EssayQuestion(
      constants.QuestionType.LONG_ESSAY,
      'Who do you think the page was from?',
      true);
  return source.makeDOMTree();
};

/**
 * Have you visited example.com before?
 * @returns {object} The DOM subtree with the question.
 */
// TODO: FILL IN CORRECT WEBSITE NAME!
commonQuestions.createPreviousVisitQuestion = function() {
  var hist = new FixedQuestion(
      constants.QuestionType.RADIO,
      'Have you visited www.example.com before?',
      true,
      ['Yes', 'No', 'I don\'t know'],
      constants.Randomize.ANCHOR_LAST);
  return hist.makeDOMTree();
};

/**
 * Have you seen a page like this before?
 * @returns {object} The DOM subtree with the question.
 */
// TODO: Make conditional on createPreviousVisitQuestion.
// TODO: Fill in correct website name!
commonQuestions.createPreviousExposureQuestion = function() {
  var errorBefore = new FixedQuestion(
      constants.QuestionType.RADIO,
      'Have you seen a page like the one pictured above when trying to visit' +
          ' www.example.com before?',
      true,
      ['Yes', 'No', 'I don\'t know'],
      constants.Randomize.ANCHOR_LAST);
  return errorBefore.makeDOMTree();
};

/**
 * What led you to the site you were trying to visit?
 * @returns {object} The DOM subtree with the question.
 */
commonQuestions.createReferrerQuestion = function() {
  var referrer = new FixedQuestion(
      constants.QuestionType.RADIO,
      'What led you to the site you were trying to visit?',
      true,
      [
        'A link on another site',
        'A link in email or a chat window',
        'A Web search',
        'I entered the address directly in the address bar',
        'One of my bookmarks',
        constants.OTHER
      ],
      constants.Randomize.ANCHOR_LAST);
  return referrer.makeDOMTree();
};

/**
 * Rank how much the attributes describe the page.
 * @returns {object} The DOM subtree with the question.
 */
commonQuestions.createAttributesQuestion = function() {
  var attributes = new ScaleQuestion(
      constants.QuestionType.MULT_HORIZ_SCALE,
      'To what degree do each of the following attributes describe this page?',
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
  return attributes.makeDOMTree();
};

/**
 * Record the URL?
 * @returns {object} The DOM subtree with the question.
 */
// TODO: Fill in real URL!
commonQuestions.createRecordUrlQuestion = function() {
  var url = new FixedQuestion(
      constants.QuestionType.RADIO,
      'May we record the URL of the website you were trying to visit, ' +
          'www.example.com, with your responses?',
      true,
      ['Yes', 'No'],
      constants.Randomize.NONE);
  return url.makeDOMTree();
};

/**
 * Anything else?
 * @returns {object} The DOM subtree with the question.
 */
commonQuestions.createClarificationQuestion = function() {
  var extra = new EssayQuestion(
      constants.QuestionType.SHORT_ESSAY,
      'Please use this space to clarify any of your responses from above or ' +
          'let us know how we can improve this survey.',
      false);
  return extra.makeDOMTree();
};
