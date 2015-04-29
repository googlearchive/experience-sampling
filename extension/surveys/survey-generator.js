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
  this.isDependentChild = false;
}

/**
 * Set a placeholder version of the question. Instead of any URLs or private
 * info that might be in the full question, this version should be PII-free.
 * @param {string} placeholder The placeholder version of the question.
 */
Question.prototype.setPlaceholder = function(placeholder) {
  this.placeholder = placeholder;
};

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
 * @return {object} The DOM node that contains the question.
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
 * @param {String} randomize Type of randomization (constants.Randomize).
 */
function FixedQuestion(
    questionType, question, required, answers, randomize) {
  Question.call(this, questionType, question, required);
  this.answers = answers;
  this.randomize = randomize;
}

FixedQuestion.prototype = Object.create(Question.prototype);
FixedQuestion.prototype.constructor = FixedQuestion;

/**
 * Attaches a dependent question to this one. The dependent question will only
 * be shown when the user selects a specific fixed answer. |this| is the parent.
 * @param {object} child The question conditional on this one.
 * @param {string} answer Show the conditional when this answer is selected.
 */
FixedQuestion.prototype.addDependentQuestion = function(child, answer) {
  this.depChild = child;
  this.depChildAnswer = answer;
  child.isDependentChild = true;
};

/**
 * Creates the DOM representation of a FixedQuestion question.
 * @return {object} The DOM node that contains the question.
 */
FixedQuestion.prototype.makeDOMTree = function() {
  var container = document.createElement('div');
  if (this.isDependentChild) {
    container.classList.add('hidden');
    container.classList.add('dependent');
    this.required = false;  // Children might be hidden.
  } else {
    container.classList.add('fieldset');
  }

  var legend = document.createElement('legend');
  legend.textContent = this.question;
  if (this.required)
    addRequiredMarker(legend);
  container.appendChild(legend);

  var shrunkenQuestion = getDomNameFromValue(this.placeholder || this.question);
  var shuffledAnswers =
      this.randomize == constants.Randomize.NONE ?
      this.answers : knuthShuffle(this.answers, this.randomize);
  switch (this.questionType) {
    case constants.QuestionType.CHECKBOX:
    case constants.QuestionType.RADIO:
      for (var i = 0; i < shuffledAnswers.length; i++) {
        var answer = document.createElement('div');
        var shrunkenAnswer = i + '-' + getDomNameFromValue(shuffledAnswers[i]) +
            '-' + shrunkenQuestion;
        var input = document.createElement('input');
        input.setAttribute('id', shrunkenAnswer);
        input.setAttribute('name', shrunkenQuestion);
        input.setAttribute('type', this.questionType);
        input.setAttribute('value', shrunkenAnswer);
        var removeRequired = function(unused) {
          var elems = document.getElementsByName(shrunkenQuestion);
          for (var i = 0; i < elems.length; i++) {
            elems[i].removeAttribute('required');
            elems[i].removeEventListener('click', removeRequired);
          }
        };
        if (this.required && constants.QuestionType.CHECKBOX) {
          // Remove the requirement once one is checked.
          input.addEventListener('change', removeRequired);
          // If there is a "prefer not to answer" option, mark that one as
          // required but leave the others alone. If there isn't, mark them
          // all as required.
          if (shuffledAnswers[i] === constants.NO_ANSWER) {
            input.setAttribute('required', this.required);
          } else if (shuffledAnswers[shuffledAnswers.length - 1] !=
                     constants.NO_ANSWER) {
            input.setAttribute('required', this.required);
          }
        } else if (this.required) {
          input.setAttribute('required', this.required);
        }
        answer.appendChild(input);

        var label = document.createElement('label');
        label.setAttribute('for', shrunkenAnswer);
        label.textContent = shuffledAnswers[i];
        answer.appendChild(label);

        if (shuffledAnswers[i] == constants.OTHER) {
          var textInput = document.createElement('input');
          textInput.setAttribute('type', 'text');
          textInput.setAttribute('name', shrunkenAnswer);
          var handleFocus = (function() {
            var currentInput = input;
            return function() {
              currentInput.checked = true;
              removeRequired();
            }
          })();
          textInput.addEventListener('focus', handleFocus);
          answer.appendChild(textInput);
        }

        if (this.depChild && this.depChildAnswer === shuffledAnswers[i]) {
          var dependentQuestion = getDomNameFromValue(
              this.depChild.placeholder || this.depChild.question);
          input.addEventListener('change', function(unused) {
            $(dependentQuestion).classList.remove('hidden');
          });
        } else if (this.depChild) {
          var dependentQuestion = getDomNameFromValue(
              this.depChild.placeholder || this.depChild.question);
          input.addEventListener('change', function(unused) {
            $(dependentQuestion).classList.add('hidden');
          });
        }
        container.appendChild(answer);
      }
      break;
    case constants.QuestionType.DROPDOWN:
      var select = document.createElement('select');
      select.setAttribute('name', shrunkenQuestion);
      var depAnswer;
      for (var i = 0; i < shuffledAnswers.length; i++) {
        var option = document.createElement('option');
        option.value = i + '-' + getDomNameFromValue(shuffledAnswers[i]);
        option.textContent = shuffledAnswers[i];
        select.appendChild(option);
        if (shuffledAnswers[i] === this.depChildAnswer)
          depAnswer = option.value;
      }
      if (!this.required) {
        var blankOption = document.createElement('option');
        blankOption.value = this.answers.length + '-NONE';
        blankOption.textContent = ' ';
        select.appendChild(blankOption);
      }

      if (this.depChild && depAnswer) {
        var depQuest = getDomNameFromValue(
            this.depChild.placeholder || this.depChild.question);
        select.addEventListener('change', function(unused) {
          if (select.value === depAnswer)
            $(depQuest).classList.toggle('hidden');
          else
            $(depQuest).classList.add('hidden');
        });
      }
      container.appendChild(select);
      break;
    default:
      throw new Error('Question "' + this.question + '" has an unexpected ' +
        'question type: ' + this.questionType);
  }

  if (this.depChild) {
    var child = this.depChild.makeDOMTree();
    child.setAttribute('id', getDomNameFromValue(
        this.depChild.placeholder || this.depChild.question));
    container.appendChild(child);
  }

  return container;
}

// SCALE

/**
 * Represents scale questions. Currently supports HORIZONTAL_SCALE and
 * VERTICAL_SCALE question types. Randomization simply flips the order to
 * preserve the scale structure.
 * @param {string} questionType Question presentation (constants.QuestionType).
 * @param {string} question The question to be asked.
 * @param {boolean} required Whether the question needs to be answered.
 * @param {Array.string} scale The labels for each point on the scale.
 * @param {String} randomize Type of randomization (constants.Randomize).
 */
function ScaleQuestion(questionType, question, required, scale, randomize) {
  Question.call(this, questionType, question, required);
  this.scale = scale;
  this.randomize = randomize;
  this.attributes = [];
}

ScaleQuestion.prototype = Object.create(Question.prototype);
ScaleQuestion.prototype.constructor = ScaleQuestion;

/**
 * For multiple horizontal scales, like this:
 *    How are you feeling?
 *    - Sad 1 2 3 4 5
 *    - Happy 1 2 3 4 5
 * Here the adjectives "Sad" and "Happy" are attributes. This must be set
 * before makeDOMTree().
 * @param {Array.string} attributes The attributes that the user is rating.
 */
ScaleQuestion.prototype.setAttributes = function(attributes) {
  if (this.questionType != constants.QuestionType.MULT_HORIZ_SCALE)
    throw new Error('Only set attributes for MULT_HORIZ_SCALE questions.');
  this.attributes = attributes;
};

/**
 * A helper method for makeDOMTree.
 * @param {boolean} horizontal Whether it is a horizontal scale.
 * @param {string} questionName The DOM-ready question name.
 * @param {boolean} reverse Whether to flip the array.
 * @param {boolean} showLabels If horizontal, whether to show the labels.
 * @private
 */
ScaleQuestion.prototype.makeSingleRow =
    function(horizontal, questionName, reverse, showLabels) {
  var container = document.createElement('div');
  if (horizontal)
    container.classList.add('horizontal-scale-container')
  var reversedScale = reverse ?
      flipArray(this.scale, this.randomize) :
      this.scale;
  for (var i = 0; i < reversedScale.length; i++) {
    var answer = document.createElement('div');
    if (horizontal)
      answer.classList.add('horizontal-scale');
    var shrunkenAnswer =
        i + '-' + getDomNameFromValue(reversedScale[i]) + '-' + questionName;

    var radio = document.createElement('input');
    radio.setAttribute('id', shrunkenAnswer);
    radio.setAttribute('name', questionName);
    radio.setAttribute('type', 'radio');
    radio.setAttribute('value', shrunkenAnswer);
    if (this.required)
      radio.setAttribute('required', this.required);

    var label = document.createElement('label');
    label.setAttribute('for', shrunkenAnswer);
    label.textContent = reversedScale[i];

    if (horizontal) {
      if (showLabels) {
        answer.appendChild(label);
        answer.appendChild(document.createElement('br'));
      }
      answer.appendChild(radio);
    } else {
      answer.appendChild(radio);
      answer.appendChild(label);
    }
    container.appendChild(answer);
  }

  if (horizontal) {
    var clearDiv = document.createElement('div');
    clearDiv.classList.add('clear-div');
    container.appendChild(clearDiv);
  }
  return container;
};

/**
 * Creates the DOM representation of a ScaleQuestion.
 * @return {object} The DOM node that contains the question.
 */
ScaleQuestion.prototype.makeDOMTree = function() {
  var horizontal =
      this.questionType == constants.QuestionType.HORIZ_SCALE ||
      this.questionType == constants.QuestionType.MULT_HORIZ_SCALE;
  var multi =
      (this.questionType == constants.QuestionType.MULT_HORIZ_SCALE) &&
      this.attributes.length > 0;

  var container = document.createElement('div');
  if (this.isDependentChild) {
    container.classList.add('hidden');
    container.classList.add('dependent');
  } else {
    container.classList.add('fieldset');
  }

  var legend = document.createElement('legend');
  legend.textContent = this.question;
  if (this.required)
    addRequiredMarker(legend);
  container.appendChild(legend);

  var reverse = this.randomize == constants.Randomize.NONE ? false : coinToss();
  var shrunkenQuestion = getDomNameFromValue(this.placeholder || this.question);
  if (multi) {
    var shuffledAttributes =
        knuthShuffle(this.attributes, constants.Randomize.ALL);
    for (var i = 0; i < shuffledAttributes.length; i++) {
      var floatScale = document.createElement('div');
      floatScale.classList.add('horizontal-rowlabel');
      if (i == 0)
        floatScale.classList.add('first-rowlabel');
      floatScale.textContent = shuffledAttributes[i] + ':';
      container.appendChild(floatScale);
      var questionName =
          getDomNameFromValue(shuffledAttributes[i]) + shrunkenQuestion;
      container.appendChild(
          this.makeSingleRow(horizontal, questionName, reverse, (i == 0)));
    }
  } else {
    container.appendChild(
        this.makeSingleRow(horizontal, shrunkenQuestion, reverse, true));
  }
  return container;
};

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
 * @return {object} The DOM node that contains the question.
 */
EssayQuestion.prototype.makeDOMTree = function() {
  var container = document.createElement('div');
  if (this.isDependentChild) {
    container.classList.add('hidden');
    container.classList.add('dependent');
  } else {
    container.classList.add('fieldset');
  }

  var legend = document.createElement('legend');
  legend.textContent = this.question;
  if (this.required)
    addRequiredMarker(legend);
  container.appendChild(legend);

  switch (this.questionType) {
    case constants.QuestionType.SHORT_STRING:
      var input = document.createElement('input');
      input.setAttribute('type', 'text');
      input.setAttribute(
          'name', getDomNameFromValue(this.placeholder || this.question));
      input.setAttribute('size', 60);
      if (this.required)
        input.setAttribute('required', this.required);
      container.appendChild(input);
      break;
    case constants.QuestionType.SHORT_ESSAY:
    case constants.QuestionType.LONG_ESSAY:
      var textarea = document.createElement('textarea');
      textarea.setAttribute(
          'name', getDomNameFromValue(this.placeholder || this.question));
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
function getDomNameFromValue(answer) {
  return answer.replace(/[\W\s]+/g, '').substring(0, 40);
}

/**
 * Use the knuth (aka Fisher-Yates) shuffle to randomize an array.
 * http://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
 * @param {Array.Object} arr The array to randomize.
 * @param {string} randomType The type of randomization (constants.Randomize)
 * @returns {Array.Object} The randomized array.
 */
function knuthShuffle(arr, randomType) {
  var end = arr.length;
  if (randomType === constants.Randomize.ANCHOR_LAST)
    end = arr.length - 1;
  if (randomType === constants.Randomize.ANCHOR_LAST_TWO)
    end = arr.length - 2; 
  for (var i = 0; i < end; i++) {
    // Random int: i <= randomIndex < arr.length
    var randomIndex = Math.floor(Math.random() * (end - i)) + i;

    // Swap with current element.
    var swapTemp = arr[i];
    arr[i] = arr[randomIndex];
    arr[randomIndex] = swapTemp;
  }
  return arr;
}

/**
 * A wrapper method for Math.random.
 * @returns {boolean} Returns true half the time.
 */
function coinToss() {
  return (Math.random() < 0.5);
}

/**
 * Flip an array.
 * @param {Array.Object} arr The array to flip.
 * @param {constants.Randomize} anchor Whether to anchor the last, the last 
 *     two, or no elements.
 * @returns {Array.Object} The flipped array.
 */
function flipArray(arr, anchor) {
  var end = arr.length;
  if (anchor === constants.Randomize.ANCHOR_LAST) {
    end = arr.length - 1;
  } else if (anchor === constants.Randomize.ANCHOR_LAST_TWO) {
    end = arr.length - 2;
  }
  var reverseArr = [];
  for (var i = end - 1; i >= 0; i--)
    reverseArr.push(arr[i]);
  if (anchor === constants.Randomize.ANCHOR_LAST) {
    reverseArr.push(arr[arr.length - 1]);
  } else if (anchor === constants.Randomize.ANCHOR_LAST_TWO) {
    reverseArr.push(arr[arr.length - 2]);
    reverseArr.push(arr[arr.length - 1]);
  }
  return reverseArr;
}

/**
 * Creates a submit button for a form.
 * @returns {object} The DOM node with the submit button.
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

/**
 * Makes an asterisk to mark required questions, and appends it to |parentNode|.
 * @param {Object} parentNode The DOM node the asterisk should be added to.
 */
function addRequiredMarker(parentNode) {
  var req = document.createElement('span');
  req.classList.add('alert');
  req.textContent = ' *';
  req.title = 'This question is required.';
  parentNode.appendChild(req);
}

/**
 * Extracts the question and answer values from a completed survey form.
 * @param {Array.Question} questionArr The set of questions.
 * @param {Object} form The containing <form> DOM node.
 * @returns {SurveySubmission.Response} The question and associated answer.
 */
function getFormValues(questionArr, form) {
  var responses = [];
  function grabQuestion(question) {
    var questionStr =
        question.placeholder || question.question;  // The question text.
    var questionLookup = getDomNameFromValue(questionStr);  // The DOM ID
    if (question.questionType === constants.QuestionType.CHECKBOX) {
      // Checkboxes may have multiple answers.
      var answerList = document.querySelectorAll(
          'input[name="' + questionLookup + '"]:checked');
      var answer = answerList[0].value || 'NOANSWER';
      for (var j = 1; j < answerList.length; j++) {
        answer = answer.concat(",", answerList[j].value)
      }
      var response = new SurveySubmission.Response(questionStr, answer);
      responses.push(response);
    } else if (question.questionType ===
               constants.QuestionType.MULT_HORIZ_SCALE) {
      // MULT_HOR_SCALE questions have multiple levels of responses.
      for (var j = 0; j < question.attributes.length; j++) {
        var attrQuestion = questionStr + '(' + question.attributes[j] + ')';
        var attrLookup = getDomNameFromValue(question.attributes[j]) +
            questionLookup;
        var answer = form[attrLookup].value || 'NOANSWER';
        var response = new SurveySubmission.Response(attrQuestion, answer);
        responses.push(response);
      }
    } else {
      var answer = form[questionLookup].value || 'NOANSWER';
      var response = new SurveySubmission.Response(questionStr, answer);
      responses.push(response);
    }
    if (question.depChild)
      grabQuestion(question.depChild);
  }
  for (var i = 0; i < questionArr.length; i++) {
    grabQuestion(questionArr[i]);
  }
  return responses;
}

/**
 * Checks whether a form has any responses or text in it.
 * @param {object} form The form to check.
 * @returns {boolean} True if the form has content.
 */
function formHasContent(form) {
  for (var i = 0; i < form.elements.length; i++) {
    var element = form.elements[i];
    switch (element.type) {
      case 'checkbox':
      case 'radio':
        if (element.checked)
          return true;
        break;
      case 'text':
      case 'password':
      case 'number':
      case 'date':
      case 'color':
      case 'range':
      case 'month':
      case 'week':
      case 'time':
      case 'datetime':
      case 'datetime-local':
      case 'email':
      case 'search':
      case 'tel':
      case 'url':
      case 'textarea':
      case 'select':
        if (element.value !== '')
          return true;
        break;
      case 'submit':
      case 'button':
        break;
    }
  }
  return false;
}
