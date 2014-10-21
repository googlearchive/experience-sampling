/**
 * SSL overridable (proceed) survey.
 */

/**
 * Adds the questions for the SSL survey.
 * @param {Object} parentNode The DOM node to attach the surveys to.
 */
function addQuestions(parentNode) {

  // TODO: FILL IN CORRECT WEBSITE NAME!
  var howChoose = new EssayQuestion(
      constants.QuestionType.LONG_ESSAY,
      'You chose "Proceed to www.example.com" instead of "Back to safety."' +
          ' How did you choose between the two options?',
      true);
  parentNode.appendChild(howChoose.makeDOMTree());

  var meaning = new EssayQuestion(
      constants.QuestionType.LONG_ESSAY,
      'What was the page trying to tell you, in your own words?',
      true);
  parentNode.appendChild(meaning.makeDOMTree());

  var source = new EssayQuestion(
      constants.QuestionType.LONG_ESSAY,
      'Who do you think the page was from?',
      true);
  parentNode.appendChild(source.makeDOMTree());

  // TODO: FILL IN CORRECT WEBSITE NAME!
  var hist = new FixedQuestion(
      constants.QuestionType.RADIO,
      'Have you visited www.example.com before?',
      true,
      ['Yes', 'No', 'I don\'t know'],
      constants.Randomize.ANCHOR_LAST);
  parentNode.appendChild(hist.makeDOMTree());

  // TODO: Make conditional on previous question.
  // TODO: Fill in correct website name!
  var errorBefore = new FixedQuestion(
      constants.QuestionType.RADIO,
      'Have you seen a page like the one pictured above when trying to visit' +
          ' www.example.com before?',
      true,
      ['Yes', 'No', 'I don\'t know'],
      constants.Randomize.ANCHOR_LAST);
  parentNode.appendChild(errorBefore.makeDOMTree());

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
  parentNode.appendChild(referrer.makeDOMTree());

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
  parentNode.appendChild(attributes.makeDOMTree());

  // TODO: Fill in real URL!
  var url = new FixedQuestion(
      constants.QuestionType.RADIO,
      'May we record the URL of the website you were trying to visit, ' +
          'www.example.com, with your responses?',
      true,
      ['Yes', 'No'],
      constants.Randomize.NONE);
  parentNode.appendChild(url.makeDOMTree());

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
