var surveyDriver = {};
surveyDriver.surveyType = '';  // Holds the type of survey.
surveyDriver.questionUrl = '';  // Holds the URL for putting into questions.
surveyDriver.questions = [];  // Holds the questions for a given survey.
surveyDriver.operatingSystem = ''; // mac, win, cros, or linux
surveyDriver.isSubmitted = false;  // Whether the user submitted the form.

/**
 * Convenience method for adding questions.
 * @param {Object} parentNode The DOM node to add the question to.
 * @param {Question} question The Question you want to add.
 */
function addQuestion(parentNode, question) {
  surveyDriver.questions.push(question);
  parentNode.appendChild(question.makeDOMTree());
}

/**
 * Finds and loads the appropriate JS file, which has the questions for this
 * particular survey. Parameters here are not trusted. The JS value should be
 * discarded unless it matches a known JS file location, and the question URL
 * value must be sanitized before being used.
 */
function loadSurveyScript() {
  function handleError() {
    console.error('Unexpected query: ' + window.location);
    window.location = '../consent.html';
  }
  function parseKeyValuePair(keyName, pairStr) {
    var paramArr = pairStr.split('=');
    if (!paramArr || paramArr.length != 2 || paramArr[0] !== keyName) {
      handleError();
      return '';  // Won't be reached because handleError will navigate.
    }
    return paramArr[1];
  }
  var query = window.location.search.substring(1);
  if (!query) handleError();
  var splitIntoPairs = query.split('&');
  if (!splitIntoPairs || splitIntoPairs.length < 3) handleError();

  // Determine the type of survey to show.
  var jsUrl = parseKeyValuePair('js', splitIntoPairs[0]);
  var extensionSurvey = false;
  switch (jsUrl) {
    case constants.SurveyLocation.SSL_OVERRIDABLE_PROCEED:
    case constants.SurveyLocation.SSL_OVERRIDABLE_NOPROCEED:
    case constants.SurveyLocation.SSL_NONOVERRIDABLE:
    case constants.SurveyLocation.MALWARE_PROCEED:
    case constants.SurveyLocation.MALWARE_NOPROCEED:
    case constants.SurveyLocation.HARMFUL_PROCEED:
    case constants.SurveyLocation.HARMFUL_NOPROCEED:
    case constants.SurveyLocation.PHISHING_PROCEED:
    case constants.SurveyLocation.PHISHING_NOPROCEED:
    case constants.SurveyLocation.VISITED_HTTPS:
    case constants.SurveyLocation.VISITED_HTTP:
      break;
    case constants.SurveyLocation.EXTENSION_PROCEED:
    case constants.SurveyLocation.EXTENSION_NOPROCEED:
      extensionSurvey = true;
      break;
    default:
      handleError();
      return;
  }
  if (!jsUrl) handleError();
  surveyDriver.surveyType = jsUrl;

  // Get the URL or extension name that the survey is about.
  if (!extensionSurvey) {
    var questionUrl = decodeURIComponent(
        parseKeyValuePair('url', splitIntoPairs[1]));
    if (!questionUrl) handleError();
    surveyDriver.questionUrl = questionUrl;
  }

  var os = decodeURIComponent(parseKeyValuePair('os', splitIntoPairs[2]));
  if (!os) handleError();
  // This switch statement needs to match PlatformInfo.
  // https://developer.chrome.com/extensions/runtime#type-PlatformInfo
  switch (os) {
    case constants.OS.MAC:
    case constants.OS.WIN:
    case constants.OS.CROS:
    case constants.OS.LINUX:
      surveyDriver.operatingSystem = os;
      break;
    case 'openbsd':
      // Coerce openbsd into Linux.
      surveyDriver.operatingSystem = constants.OS.LINUX;
      break;
    case 'android':
      // You can't install extensions into Android, so this shouldn't happen.
      handleError();
      break;
    default:
      surveyDriver.operatingSystem = constants.OS.OTHER;
  }

  // Load the JS file and start the survey setup.
  var head = document.head;
  var script = document.createElement('script');
  script.addEventListener('load', setupSurvey);
  script.setAttribute('src', jsUrl);
  head.appendChild(script);
}

/**
 * Return a pretty-printed version of the user's operating system.
 * Suitable for display.
 * @returns {string} The user's OS.
 */
function prettyPrintOS() {
  switch (surveyDriver.operatingSystem) {
    case constants.OS.MAC:
      return 'Mac OS X';
    case constants.OS.WIN:
      return 'Windows';
    case constants.OS.CROS:
      return 'Chrome OS';
    case constants.OS.LINUX:
      return 'Linux';
    case constants.OS.OTHER:
    default:
      return 'Your operating system';
  }
  return 'Your operating system';
}

/**
 * Sets up the survey form.
 */
function setupSurvey() {
  console.log('Setting up a survey');
  setScreenshot();
  $('explanation').classList.remove('hidden');
  $('survey-container').classList.remove('hidden');
  addQuestions($('survey-form'));
  $('survey-form').appendChild(makeSubmitButtonDOM());
  document.forms['survey-form'].addEventListener(
      'submit', setupFormSubmitted);
  var selectElements = document.getElementsByTagName('select');
  for (var i = 0; i < selectElements.length; i++) {
    selectElements[i].selectedIndex = -1;
  }
}

/**
 * Handles the submission of the setup survey.
 * @param {object} event The submission button click event.
 */
function setupFormSubmitted(event) {
  event.preventDefault();

  surveyDriver.isSubmitted = true;
  var responses = getFormValues(
      surveyDriver.questions, document['survey-form']);
  var urlConsentQ = commonQuestions.createRecordUrlQuestion();
  var lookup = getDomNameFromValue(urlConsentQ.question);
  if (document['survey-form'][lookup] &&
      document['survey-form'][lookup].value === ('0-Yes-' + lookup)) {
    var urlResponse = new SurveySubmission.Response(
        'URL', surveyDriver.questionUrl);
    responses.push(urlResponse);
  }
  chrome.runtime.sendMessage(
    {
      'message_type': constants.MSG_SURVEY,
      'survey_type': surveyDriver.surveyType,
      'responses': responses
    }
  );
  $('explanation').classList.add('hidden');
  $('survey-container').classList.add('hidden');
  $('thank-you').classList.remove('hidden');
  setTimeout(window.close, constants.SURVEY_CLOSE_TIME);
}
document.addEventListener('DOMContentLoaded', loadSurveyScript);

/**
 * Prompt the user on close, if the form has been started but not yet submitted.
 * @param {object} event The window close event.
 */
function promptOnClose(event) {
  if (surveyDriver.isSubmitted) return;
  if (!formHasContent($('survey-form'))) return;

  event.returnValue = "Oops! Closing now will throw away your answers.";
}
window.addEventListener('beforeunload', promptOnClose);
