var surveyDriver = {};
surveyDriver.questionUrl = 'example.com';

/**
 * Adapted from driver.js. This function is needed for testing, but 
 * including the whole driver.js file in SpecRunner.html causes a redirect
 * to consent.html, so testing is prevented.
 */
function addQuestion(parentNode, question) {
  parentNode.appendChild(question.makeDOMTree());
}

describe('extension-proceed', function() {
  var parentNode;

  beforeEach(function() {
    parentNode = document.createElement('FORM');
    parentNode.name = 'testForm';
  });

  it('generates 7 questions', function() {
    addQuestions(parentNode);
    expect(parentNode.getElementsByTagName('legend').length)
        .toEqual(7);
  });

  it('generates the choice question 1st', function() {
    addQuestions(parentNode);
    expect(parentNode.getElementsByTagName('legend')[0].textContent)
        .toEqual('You chose "Add"' +
        ' instead of "Cancel." How did you choose between' +
        ' the two options?');
  });

  it('generates the page-meaning question 2nd', function() {
    addQuestions(parentNode);
    expect(parentNode.getElementsByTagName('legend')[1].textContent)
        .toEqual('What was the dialog trying to tell you, in your own words?');
  });

  it('generates the page-source question and responses 3rd', function() {
    addQuestions(parentNode);
    expect(parentNode.getElementsByTagName('legend')[2].textContent)
        .toEqual('Who was the dialog from?');

    fieldsetElement = parentNode.getElementsByClassName('fieldset')[2];
    var labels = fieldsetElement.getElementsByTagName('label');
    expect(labels.length).toEqual(5);

    var labelTexts = '';
    for (var i = 0; i < labels.length; i++) {
      labelTexts += labels[i].textContent;
    }
    expect(labelTexts).toContain('Chrome (my browser)');
    expect(labelTexts).toContain('A hacker');
    expect(labelTexts).toContain('Windows');
    expect(labelTexts).toContain('example.com');
    expect(labelTexts).toContain('Other');
  });

  it('generates the referrer question 4th', function() {
    addQuestions(parentNode);
    expect(parentNode.getElementsByTagName('legend')[3].textContent)
        .toEqual('What led you to try to install the extension or app' +
        ' mentioned in the dialog?');
  });

  it('generates the attributes question and responses 5th', function() {
    addQuestions(parentNode);
    expect(parentNode.getElementsByTagName('legend')[4].textContent)
        .toEqual('To what degree do each of the following adjectives' +
        ' describe the dialog?');

    fieldsetElement = parentNode.getElementsByClassName('fieldset')[4];
    var labels = fieldsetElement.getElementsByTagName('label');
    expect(labels.length).toEqual(5);

    var labelTexts = '';
    for (var i = 0; i < labels.length; i++) {
      labelTexts += labels[i].textContent;
    }
    expect(labelTexts).toContain('Not at all');
    expect(labelTexts).toContain('A little bit');
    expect(labelTexts).toContain('A moderate amount');
    expect(labelTexts).toContain('Very much');
    expect(labelTexts).toContain('A great deal');
  });

  it('generates the what-extension question 6th', function() {
    addQuestions(parentNode);
    expect(parentNode.getElementsByTagName('legend')[5].textContent)
        .toEqual('What is the name of the extension or app you were' +
        ' trying to install?');
  });

  it('generates the clarification question 7th', function() {
    addQuestions(parentNode);
    expect(parentNode.getElementsByTagName('legend')[6].textContent)
        .toEqual('Please use this space to clarify any of your responses' +
        ' from above or let us know how we can improve this survey.');
  });

});
