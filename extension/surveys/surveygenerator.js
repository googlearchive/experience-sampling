/**
 * Provides the prototypes for dynamically creating survey questions.
 */

/**
 * Represents a survey question.
 * @constructor
 * @param {string} questionType Question presentation (constants.QuestionType).
 * @param {string} question The question to be asked.
 * @param {boolean} required Whether the question needs to be answered.
 */
function Question(questionType, question, required) {
  this.questionType = questionType;
  this.question = question;
  this.required = required;
  this.userResponse = "";
}

/**
 * Stores the answer chosen by the user. Should be used after the respondent
 * has submitted the survey form.
 * @param {string} The text of the user's answer.
 */
Question.prototype.setUserResponse = function(response) {
  this.userResponse = response;
};


/**
 * Creates the DOM representation of a question. This should be implemented
 * by any subclasses!
 * @return {Object} The DOM node that contains the question.
 */
Question.prototype.makeDOMTree = function() {
  return document.createElement('div');
};

// FIXED

/**
 * Represents questions with a fixed set of non-scale responses. Currently
 * supports CHECKBOX, RADIO, and DROPDOWN question types. If randomized, the
 * full list will be ordered pseudorandomly.
 * @param {string} questionType Question presentation (constants.QuestionType).
 * @param {string} question The question to be asked.
 * @param {boolean} required Whether the question needs to be answered.
 * @param {Array.string} answers The list of answers to be shown.
 * @param {boolean} randomize Whether to randomize the question order.
 */
function FixedQuestion(questionType, question, required, answers, randomize) {
  Question.call(this, questionType, question, required);
  this.answers = answers;
  this.randomize = randomize;
}

FixedQuestion.prototype = Object.create(Question.prototype);
FixedQuestion.prototype.constructor = FixedQuestion;

/**
 * Creates the DOM representation of a FixedQuestion question.
 * @return {Object} The DOM node that contains the question.
 */
// TODO(felt): Implement answer randomization.
FixedQuestion.prototype.makeDOMTree = function() {
  var container = document.createElement('div');
  container.classList.add('fieldset');

  var legend = document.createElement('legend');
  legend.textContent = this.question;
  container.appendChild(legend);

  var shrunkenQuestion = shrink(this.question);
  switch (this.questionType) {
    case constants.QuestionType.CHECKBOX:
    case constants.QuestionType.RADIO:
      for (var i = 0; i < this.answers.length; i++) {
        var shrunkenAnswer = i + '-' + shrink(this.answers[i]);
        var input = document.createElement('input');
        input.setAttribute('id', shrunkenAnswer);
        input.setAttribute('name', shrunkenQuestion);
        input.setAttribute('type', this.questionType);
        input.setAttribute('value', shrunkenAnswer);
        input.setAttribute('required', this.required);
        container.appendChild(input);

        var label = document.createElement('label');
        label.setAttribute('for', shrunkenAnswer);
        label.textContent = this.answers[i];
        container.appendChild(label);

        if (this.answers[i] == constants.OTHER) {
          var textInput = document.createElement('input');
          textInput.setAttribute('type', 'text');
          textInput.setAttribute('name', shrunkenAnswer);
          container.appendChild(textInput);
        }

        if (i < this.answers.length - 1)
          container.appendChild(document.createElement('br'));
      }
      break;
    case constants.QuestionType.DROPDOWN:
      var select = document.createElement('select');
      for (var i = 0; i < this.answers.length; i++) {
        var option = document.createElement('option');
        option.value = i + '-' + shrink(this.answers[i]);
        option.textContent = this.answers[i];
        select.appendChild(option);
      }
      container.appendChild(select);
      break;
    default:
      throw new Error('Question "' + this.question + '" has an unexpected ' +
        'question type: ' + this.questionType);
  }
  return container;
}

// SCALE

// TODO(felt): Implement and document this.
function ScaleQuestion(
    questionType, question, required, direction, labels, randomize) {
  Question.call(this, questionType, question, required);
}

ScaleQuestion.prototype = Object.create(Question.prototype);
ScaleQuestion.prototype.constructor = ScaleQuestion;

// ESSAY

/**
 * Represents free response questions. Currently supports SHORT_STRING,
 * SHORT_ESSAY and LONG_ESSAY question types.
 * @param {string} questionType Question presentation (constants.QuestionType).
 * @param {string} question The question to be asked.
 * @param {boolean} required Whether the question needs to be answered.
 */
function EssayQuestion(questionType, question, required) {
  Question.call(this, questionType, question, required);
}

EssayQuestion.prototype = Object.create(Question.prototype);
EssayQuestion.prototype.constructor = EssayQuestion;

/**
 * Creates the DOM representation of an EssayQuestion.
 * @return {Object} The DOM node that contains the question.
 */
EssayQuestion.prototype.makeDOMTree = function() {
  var container = document.createElement('div');
  container.classList.add('fieldset');

  var legend = document.createElement('legend');
  legend.textContent = this.question;
  container.appendChild(legend);

  switch (this.questionType) {
    case constants.QuestionType.SHORT_STRING:
      var input = document.createElement('input');
      input.setAttribute('type', 'text');
      input.setAttribute('name', shrink(this.question));
      if (this.required)
        input.setAttribute('required', this.required);
      container.appendChild(input);
      break;
    case constants.QuestionType.SHORT_ESSAY:
    case constants.QuestionType.LONG_ESSAY:
      var textarea = document.createElement('textarea');
      textarea.setAttribute('name', shrink(this.question));
      textarea.setAttribute('cols', 60);
      textarea.setAttribute(
          'rows',
          this.questionType == constants.QuestionType.SHORT_ESSAY ? 5 : 10);
      if (this.required)
        textarea.setAttribute('required', this.required);
      container.appendChild(textarea);
      break;
    default:
      throw new Error('Question "' + this.question + '" has an unexpected ' +
        'question type: ' + this.questionType);
  }
  return container;
}

// HELPER METHODS

/**
 * Turns the full string into a short name for a value property. It does this
 * by removing all non-alphabetic characters and truncating to 40 characters.
 * @param {string} The original input answer.
 * @returns {string} The shrunken version of the answer.
 */
function shrink(answer) {
  return answer.replace(/[\W\s]+/g, '').substring(0, 40);
}

/**
 * Creates a submit button for a form.
 * @returns {Object} The DOM node with the submit button.
 */
function makeSubmitButtonDOM() {
  var button = document.createElement('input');
  button.setAttribute('id', 'submit-button');
  button.setAttribute('type', 'submit');
  button.setAttribute('value', 'Submit');

  var fieldset = document.createElement('fieldset');
  fieldset.classList.add('submit');
  fieldset.appendChild(button);
  return fieldset;
}
