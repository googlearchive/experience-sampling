/**
 * Adds the basic structure of the survey page.
 */
function setupSkeleton() {
  document.title = 'Chrome Survey';

  // Contains the image.
  var imgHolder = document.createElement('div');
  imgHolder.classList.add('centered');
  imgHolder.classList.add('inner-centering');
  imgHolder.classList.add('hidden');
  imgHolder.setAttribute('id', 'explanation');
  var img = document.createElement('img');
  img.classList.add('example');
  img.setAttribute('height', '200px');
  img.setAttribute('id', 'example-img');
  imgHolder.appendChild(img);

  // Contains the thank you message.
  var thanksHolder = document.createElement('div');
  thanksHolder.classList.add('centered');
  thanksHolder.classList.add('inner-centering');
  thanksHolder.classList.add('hidden');
  thanksHolder.setAttribute('id', 'thank-you');
  var pThanks = document.createElement('p');
  pThanks.classList.add('heavy');
  pThanks.textContent = 'Thank you for participating!';
  thanksHolder.appendChild(pThanks);
  var pClose = document.createElement('p');
  pClose.textContent = 'This window will close in a few seconds.';
  thanksHolder.appendChild(pClose);

  // Contains the scrollable area and form.
  var scrollArea = document.createElement('div');
  scrollArea.classList.add('hidden');
  scrollArea.classList.add('centered');
  scrollArea.classList.add('scroll-scroll');
  scrollArea.setAttribute('id', 'survey-container');
  var instructions = document.createElement('div');
  instructions.classList.add('alert');
  instructions.classList.add('centered');
  instructions.classList.add('inner-centering');
  instructions.setAttribute('id', 'instructions');
  scrollArea.appendChild(instructions);
  var pAbove = document.createElement('p');
  pAbove.classList.add('heavy');
  pAbove.textContent = 'You recently saw a page like the one pictured above.';
  instructions.appendChild(pAbove);
  var pFollowing = document.createElement('p');
  pFollowing.textContent = 'The following questions are about that page.';
  instructions.appendChild(pFollowing);
  var form = document.createElement('form');
  form.setAttribute('name', 'survey-form');
  form.setAttribute('id', 'survey-form');
  scrollArea.appendChild(form);

  // Put everything in the page.
  var scrollHolder = document.createElement('div');
  scrollHolder.classList.add('scroll-holder');
  scrollHolder.appendChild(imgHolder);
  scrollHolder.appendChild(thanksHolder);
  scrollHolder.appendChild(scrollArea);
  document.body.appendChild(scrollHolder);
}

/**
 * Sets up the survey form.
 */
function setupSurvey() {
  console.log('Setting up a survey');
  setupSkeleton();
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

document.addEventListener('DOMContentLoaded', setupSurvey);
