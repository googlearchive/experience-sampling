/**
 * Defines common questions that are repeated across surveys.
 */

var commonQuestions = {};

/**
 * How did you choose between the two options? Note that the options should be
 * flipped for the proceed & no-proceed scenarios.
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
  return howChoose;
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
  return meaning;
};

/**
 * Who was the page from?
 * @returns {object} The DOM subtree with the question.
 */
commonQuestions.createPageSourceQuestion = function() {
  var source = new EssayQuestion(
      constants.QuestionType.LONG_ESSAY,
      'Who do you think the page was from?',
      true);
  return source;
};

/**
 * Have you visited example.com before?
 * @returns {object} The DOM subtree with the question.
 */
commonQuestions.createHistoryQuestions = function() {
  var hist = new FixedQuestion(
      constants.QuestionType.RADIO,
      'Have you visited ' + surveyDriver.questionUrl + ' before?',
      true,
      ['Yes', 'No', 'I don\'t know'],
      constants.Randomize.ANCHOR_LAST);
  var errorBefore = new FixedQuestion(
      constants.QuestionType.RADIO,
      'Have you seen a page like the one pictured above when trying to visit ' +
          surveyDriver.questionUrl + ' before?',
      true,
      ['Yes', 'No', 'I don\'t know'],
      constants.Randomize.ANCHOR_LAST);
  hist.addDependentQuestion(errorBefore, 'Yes');
  return hist;
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
  return referrer;
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
  return attributes;
};

/**
 * Record the URL?
 * @returns {object} The DOM subtree with the question.
 */
commonQuestions.createRecordUrlQuestion = function() {
  var url = new FixedQuestion(
      constants.QuestionType.RADIO,
      'May we record the URL of the website you were trying to visit, ' +
          surveyDriver.questionUrl + ', with your responses?',
      true,
      ['Yes', 'No'],
      constants.Randomize.NONE);
  return url;
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
  return extra;
};

commonQuestions.createTrustQuestion = function() {
var trust = new ScaleQuestion(
constants.QuestionType.VERTICAL_SCALE,
'How much do you trust ' + surveyDriver.questionUrl + '?',
true,
[
'Strongly distrust',
'Somewhat distrust',
'Neither trust nor distrust',
'Somewhat trust',
'Strongly trust'
],
constants.Randomize.ALL);
return trust;
};
