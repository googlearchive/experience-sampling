describe('setup', function() {
  var parentNode;

  beforeEach(function() {
    parentNode = document.createElement('FORM');
    parentNode.name = 'testForm';
  });

  it('generates 10 questions', function() {
    addQuestions(parentNode);
    expect(parentNode.getElementsByTagName('legend').length)
        .toEqual(10);
  });

  it('generates the age question and responses 1st', function() {
    addQuestions(parentNode);
    expect(parentNode.getElementsByTagName('legend')[0].textContent)
        .toEqual('What is your age? *');

    fieldsetElement = parentNode.getElementsByClassName('fieldset')[0];
    var labels = fieldsetElement.getElementsByTagName('label');
    expect(labels.length).toEqual(8);

    expect(labels[0].textContent).toEqual('17 years old or younger');
    expect(labels[1].textContent).toEqual('18-24');
    expect(labels[2].textContent).toEqual('25-34');
    expect(labels[3].textContent).toEqual('35-44');
    expect(labels[4].textContent).toEqual('45-54');
    expect(labels[5].textContent).toEqual('55-64');
    expect(labels[6].textContent).toEqual('65 or older');
    expect(labels[7].textContent).toEqual('I prefer not to answer');
  });

  it('generates the gender question and responses 2nd', function() {
    addQuestions(parentNode);
    expect(parentNode.getElementsByTagName('legend')[1].textContent)
        .toEqual('What is your gender? *');

    fieldsetElement = parentNode.getElementsByClassName('fieldset')[1];
    var labels = fieldsetElement.getElementsByTagName('label');
    expect(labels.length).toEqual(4);

    expect(labels[0].textContent).toEqual('Female');
    expect(labels[1].textContent).toEqual('Male');
    expect(labels[2].textContent).toEqual('Other: ');
    expect(labels[3].textContent).toEqual('I prefer not to answer');
  });

  it('generates the education question and responses 3rd', function() {
    addQuestions(parentNode);
    expect(parentNode.getElementsByTagName('legend')[2].textContent)
        .toEqual('What is the highest degree or level of school that' +
        ' you have completed? *');

    fieldsetElement = parentNode.getElementsByClassName('fieldset')[2];
    var labels = fieldsetElement.getElementsByTagName('label');
    expect(labels.length).toEqual(9);

    expect(labels[0].textContent).toEqual('Some high school');
    expect(labels[1].textContent).toEqual('High school or equivalent');
    expect(labels[2].textContent).toEqual('Technical/Trade school');
    expect(labels[3].textContent).toEqual('Some university, no degree');
    expect(labels[4].textContent).toEqual('Associates degree (for' +
    ' example, AS, AA)');
    expect(labels[5].textContent).toEqual('Bachelors degree (for' +
    ' example, BS, BA)');
    expect(labels[6].textContent).toEqual('Graduate degree');
    expect(labels[7].textContent).toEqual('Other: ');
    expect(labels[8].textContent).toEqual('I prefer not to answer');
  });

  it('generates the occupation question 4th', function() {
    addQuestions(parentNode);
    expect(parentNode.getElementsByTagName('legend')[3].textContent)
        .toEqual('What is your occupation?');
  });

  it('generates the country and state question and responses 5th and 6th', 
      function() {
    addQuestions(parentNode);
    expect(parentNode.getElementsByTagName('legend')[4].textContent)
        .toEqual('In what country do you live?');
    expect(parentNode.getElementsByTagName('legend')[5].textContent)
        .toEqual('Which state?');

    fieldsetElement = parentNode.getElementsByClassName('fieldset')[4];
    var labels = fieldsetElement.getElementsByTagName('option');
    expect(labels.length).toEqual(297);

    // Spot-check the 239 countries (plus NONE)
    expect(labels[0].textContent).toEqual(' ');
    expect(labels[1].textContent).toEqual('United States of America');
    expect(labels[53].textContent).toEqual('Cote d\'Ivoire');
    expect(labels[120].textContent).toEqual('Lebanon');
    expect(labels[147].textContent).toEqual('Namibia');
    expect(labels[239].textContent).toEqual('Zimbabwe');

    // Spot-check the 50 states, 1 district, and 5 territories (plus NONE)
    expect(labels[240].textContent).toEqual(' ');
    expect(labels[241].textContent).toEqual('Alabama');
    expect(labels[243].textContent).toEqual('Arizona');
    expect(labels[250].textContent).toEqual('Georgia');
    expect(labels[263].textContent).toEqual('Minnesota');
    expect(labels[284].textContent).toEqual('Utah');
    expect(labels[296].textContent).toEqual('Northern Mariana Islands');
  });

  it('generates the source question 7th', function() {
    addQuestions(parentNode);
    expect(parentNode.getElementsByTagName('legend')[6].textContent)
        .toEqual('How did you hear about this study?');
  });

  it('generates the computerOwner question and responses 8th', function() {
    addQuestions(parentNode);
    expect(parentNode.getElementsByTagName('legend')[7].textContent)
        .toEqual('Whose computer are you using? *');

    fieldsetElement = parentNode.getElementsByClassName('fieldset')[6];
    var labels = fieldsetElement.getElementsByTagName('label');
    expect(labels.length).toEqual(7);

    expect(labels[0].textContent).toEqual('Mine');
    expect(labels[1].textContent).toEqual('A friend or family member\'s');
    expect(labels[2].textContent).toEqual('My employer\'s');
    expect(labels[3].textContent).toEqual('My school\'s');
    expect(labels[4].textContent).toEqual('A library\'s');
    expect(labels[5].textContent).toEqual('Other: ');
    expect(labels[6].textContent).toEqual('I prefer not to answer');
  });

  it('generates the antivirus question and responses 9th', function() {
    addQuestions(parentNode);
    expect(parentNode.getElementsByTagName('legend')[8].textContent)
        .toEqual('Does the computer you\'re using have anti-virus' +
        ' software running on it? *');

    fieldsetElement = parentNode.getElementsByClassName('fieldset')[7];
    var labels = fieldsetElement.getElementsByTagName('label');
    expect(labels.length).toEqual(4);

    expect(labels[0].textContent).toEqual('Yes');
    expect(labels[1].textContent).toEqual('No');
    expect(labels[2].textContent).toEqual('I don\'t know');
    expect(labels[3].textContent).toEqual('I prefer not to answer');
  });

  it('generates the techFamiliar question 10th', function() {
    addQuestions(parentNode);
    expect(parentNode.getElementsByTagName('legend')[9].textContent)
        .toEqual('How familiar are you with each of the following' +
        ' computer and Internet-related items? I have...');

    fieldsetElement = parentNode.getElementsByClassName('fieldset')[8];
    var labels = fieldsetElement.getElementsByTagName('label');
    expect(labels.length).toEqual(5);

    var labelTexts = '';
    for (var i = 0; i < labels.length; i++) {
      labelTexts += labels[i].textContent;
    }

    expect(labelTexts).toContain('No understanding');
    expect(labelTexts).toContain('Little understanding');
    expect(labelTexts).toContain('Some understanding');
    expect(labelTexts).toContain('Good understanding');
    expect(labelTexts).toContain('Full understanding');
  });

});
