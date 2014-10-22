/**
 * Finds and loads the appropriate JS file, which has the questions for this
 * particular survey.
 */
function loadSurveyScript() {
  // Grab the JS file location from the url and check it's a valid location.
  var handleError = function() {
    console.log('Unexpected query: ' + window.location);
    window.location = '../consent.html';
  };
  var query = window.location.search.substring(1);
  if (!query) handleError();
  var splitArr = query.split('=');
  if (!splitArr || splitArr.length != 2) handleError();
  var jsUrl = (query.split('='))[1];
  switch (jsUrl) {
    case constants.SurveyLocation.SSL_OVERRIDABLE_PROCEED:
    case constants.SurveyLocation.SSL_OVERRIDABLE_NOPROCEED:
    case constants.SurveyLocation.SSL_NONOVERRIDABLE:
    case constants.SurveyLocation.MALWARE_PROCEED:
    case constants.SurveyLocation.MALWARE_NOPROCEED:
    case constants.SurveyLocation.PHISHING_PROCEED:
    case constants.SurveyLocation.PHISHING_NOPROCEED:
    case constants.SurveyLocation.EXTENSION_PROCEED:
    case constants.SurveyLocation.EXTENSION_NOPROCEED:
      break;
    default:
      handleError();
      return;
  }

  // Load the JS file and start the survey setup.
  var head = document.getElementsByTagName('head')[0];
  var script = document.createElement('script');
  script.addEventListener('load', setupSurvey);
  script.setAttribute('src', jsUrl);
  head.appendChild(script);
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

document.addEventListener('DOMContentLoaded', loadSurveyScript);
