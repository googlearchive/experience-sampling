"""Functions for processing CUES data in AppEngine JSON format into CSV format
"""

import copy
import csv
import datetime
from json import JSONDecoder
import re

DATE_FORMAT = '%Y-%m-%dT%H:%M:%S'
DOGFOOD_START_DATE = datetime.datetime(2014, 12, 01, 0, 0, 0, 0)
PLACEHOLDER_END_DATE = datetime.datetime(2014, 12, 18, 18, 44, 40, 954000)
CONDITIONS = [
    'ssl-overridable-proceed', 'ssl-overridable-noproceed',
    'ssl-nonoverridable', 'malware-proceed', 'malware-noproceed',
    'phishing-proceed', 'phishing-noproceed', 'extension-proceed',
    'extension-noproceed']
ATTRIBUTE_QUESTION_PREFIX = 'To what degree do each of the following'

def processResults(jsonInFile, csvOutFile):
  parsedDemo, parsedEvents = parseSurveyResults(jsonInFile)
  parsedEvents = discardResultsBeforeDate(parsedEvents, DOGFOOD_START_DATE)

  for c in CONDITIONS:
    FilterByCondition
    CanonicalizeQuestions
    WriteToCsv
    
  try:
    qaList = canonicalizeQuestionAnswerList('ssl-overridable-proceed',
        parsedEvents)
  except UnexpectedFormatException as e:
    print 'Exception in ssl-overridable-proceed: ', e.value

  try:
    qaList = canonicalizeQuestionAnswerList('ssl-overridable-noproceed',
        parsedEvents)
  except UnexpectedFormatException as e:
    print 'Exception in ssl-overridable-noproceed: ', e.value

  try:
    qaList = canonicalizeQuestionAnswerList('ssl-nonoverridable',
        parsedEvents)
  except UnexpectedFormatException as e:
    print 'Exception in ssl-nonoverridable: ', e.value

  try:
    qaList = canonicalizeQuestionAnswerList('malware-proceed', parsedEvents)
  except UnexpectedFormatException as e:
    print 'Exception in malware-proceed: ', e.value

  try:
    qaList = canonicalizeQuestionAnswerList('malware-noproceed', parsedEvents)
  except UnexpectedFormatException as e:
    print 'Exception in malware-noproceed: ', e.value

  try:
    qaList = canonicalizeQuestionAnswerList('phishing-proceed', parsedEvents)
  except UnexpectedFormatException as e:
    print 'Exception in phishing-proceed: ', e.value

  try:
    qaList = canonicalizeQuestionAnswerList('phishing-noproceed', parsedEvents)
  except UnexpectedFormatException as e:
    print 'Exception in phishing-noproceed: ', e.value

  try:
    qaList = canonicalizeQuestionAnswerList('extension-proceed', parsedEvents)
  except UnexpectedFormatException as e:
    print 'Exception in extension-proceed: ', e.value

  try:
    qaList = canonicalizeQuestionAnswerList('extension-noproceed',
        parsedEvents)
  except UnexpectedFormatException as e:
    print 'Exception in extension-noproceed: ', e.value  
  
def parseSurveyResults(inFile):
  with open(inFile, 'r') as jsonFile:
      s = jsonFile.read()
  parsed = parseJsonObjects(s)
  demographic = filter(lambda x: x['survey_type'] == 'setup.js', parsed)
  events = filter(lambda x: x['survey_type'] != 'setup.js', parsed)
  return demographic, events
  
def parseJsonObjects(s):
  decoder = JSONDecoder()
  sLen = len(s)
  objs = []
  end = 0
  while end < sLen and end != -1:
    obj, end = decoder.raw_decode(s, idx=end)
    objs.append(obj)
    end = s.find('{', end)
  return objs

def discardResultsBeforeDate(parsedResults, date):
  return filter(lambda x: datetime.datetime.strptime(
      x['date_taken'].split('.')[0], DATE_FORMAT) >= DOGFOOD_START_DATE,
      parsedResults)

# Get a list of lists of question-answer pairs, and canonicalize the order
# and question text of the lists for the given condition.
# Return the list of lists and an index to a list whose questions can be used
# as column headers of a CSV file.
#
# Some of the challenges to finding the canonical
# question list are: some questions were replaced with PLACEHOLDER;
# attribute questions are in randomized order; sometimes URL was supposed
# to be replaced by a placeholder but wasn't; some question lists are longer
# than others because they sent back URL as a question if the participant gave
# consent.
def canonicalizeQuestionAnswerList(cond, parsed_results):
  if cond not in CONDITIONS: raise ValueError(
      cond + ' is not a valid condition')

  filtered_results = [pr for pr in parsed_results
                 if pr['survey_type'] == cond + '.js']

  # Some results from an early version of the survey extension just have
  # 'PLACEHOLDER' as the text for every question; find the results from
  # later versions that actually have the question text.
  filtered_results = [r for r in filtered_results
                      if r['responses'][0]['question'] != 'PLACEHOLDER']

  if not filtered_results:
    raise UnexpectedFormatException('No results with questions found for ' +
        cond + ' condition')

  ReorderAttributeQuestions(filtered_results)
  ReplaceUrlWithPlaceholder(filtered_results)

  max_list_len = len(filtered_results[0]['responses'])
  index_of_max_len_list = 0
  for i, r in enumerate(filtered_results):
    if len(r['responses']) > max_list_len:
      max_list_len = len(r['responses'])
      index_of_max_len_list = i

  # Do some light error checking; all questions lists should now be the same,
  # except some question lists may have extra questions. So, check each list
  # of questions against the longest list of questions.
  for i, qa_pair in enumerate(
      filtered_results[index_of_max_len_list]['responses']):
    for j, r in enumerate(filtered_results):
      if i < len(r['responses']):
        if (qa_pair['question'] != r['responses'][i]['question']):
          raise QuestionError(
              'Question text differs: Question %d, queestion list %d is {'
              '%s}. Question %d, question list %d is {%s}.'
              % (i, index_of_max_len_list, qa_pair['question'],
                 i, j, r['responses'][i]['question']))

  canonical_questions = [
      qa_pair['question']
      for qa_pair in filtered_results[index_of_max_len_list]['responses']]
  WriteToCsv(filtered_results, canonical_questions, 'out.csv')

#  return qaLists, indexOfMaxLenList

def WriteToCsv(results, canonical_questions, out_file):
  """Write results for a given condition to a CSV file

  Given a list of results in the expected format, writes
  date_received, date_taken,  participant_id, survey_type, and
  answers to each survey question to a CSV file. Uses
  canonical_questions as column headers for corresponding answers.
    
  Args:
    results: List of results, where each result is a dict
      containing metadata and response data from a survey response.
      The results list should be filtered for one condition, and
      questions in the response data should be canonicalized.
    canonical_questions: List of questions to use as CSV column headers.
    out_file: CSV file to write output to.

  Returns:
    None.
  """
  # Use the Python csv library to write to csv format. The writer in this
  # library requires data to be a list of rows in flat field_name:data form.
  # So, we put it in the required form, open the CSV file, and write the data.
  results_for_csv_writer = []
  for r in results:
    dict_for_csv_writer = {}
    for qa_pair in r['responses']:
      dict_for_csv_writer[qa_pair['question']] = qa_pair['answer']
    dict_for_csv_writer.update(r)
    del dict_for_csv_writer['responses']
    results_for_csv_writer.append(dict_for_csv_writer)

  with open(out_file, 'w') as csv_file:
    field_names = ['date_received', 'date_taken', 'participant_id',
        'survey_type']
    field_names.extend(canonical_questions)
    csv_writer = csv.DictWriter(csv_file, field_names)
    csv_writer.writeheader()
    csv_writer.writerows(results_for_csv_writer)

class QuestionError(BaseException):
  def __init__(self, value):
    self.value = value
  def __str__(self):
    return(repr(self.value))

class UnexpectedFormatException(BaseException):
  def __init__(self, value):
    self.value = value
  def __str__(self):
    return(repr(self.value))
      
def ReorderAttributeQuestions(results):
  """Alphabetize attribute questions

  The attribute questions are presented in random order, so we
  need to reorder them into a canonical order for the output CSV
  file. This uses alphabetical order as canonical order.

  Args:
    results: A list of dicts containing parsed and filtered results.
        Is it assumed that results has been filtered for a given survey
        condition, such that attributes questions should all appear in the
        same place.

  Returns:
    The altered results. Changes the input results list as well.

  Raises:
    UnexpectedFormatException: Something unexpected found in input.
  """
  # Gather a list of lists of the indices of the attribute questions in
  # each result
  attribute_question_indices = []
  for r in results:
    index_list = []
    for i, qa_pair in enumerate(r['responses']):
      if ATTRIBUTE_QUESTION_PREFIX in qa_pair['question']:
        index_list.append(i)
      attribute_question_indices.append(index_list)

  # Do some error checking; attribute questions should have the same indices
  # for all results and should appear consecutively. Since they should be the
  # same for all results, we grab the min and max index from the first result.
  if not attribute_question_indices:
      raise UnexpectedFormatException ('Attributes questions not found.')
  min_index = attribute_question_indices[0][0]
  max_index = attribute_question_indices[0][-1]
  for i, index_list in enumerate(attribute_question_indices):
    if min(index_list) != min_index or max(index_list) != max_index:
      raise UnexpectedFormatException(
          'min and max indices in list %d not equal to min and max index '
          'in list 0' % (i))
    if index_list != range(min_index,max_index+1): # Check for consecutive
      raise UnexpectedFormatException(
          'indices in list %d not consecutive' % (i))

  for r in results:
    r['responses'][min_index:max_index+1] = sorted(
        r['responses'][min_index:max_index+1],
        key=lambda x: x['question'])

  return results

def ReplaceUrlWithPlaceholder(results):
  """Fix a bug by replacing domain names with [URL]
    
  There seems to be a bug that URLs were included in questions where they
  were supposed to have a placeholder. Specifically, text like
  "Proceed to www.example.com" should be replaced with "Proceed to [URL]".
  These questions were the first question asked, so this function will only
  do the replacement in the first question in each result.

  Args:
    results:  A list of dicts containing parsed and filtered results.
        Is it assumed that results has been filtered for a given survey
        condition, such that attributes questions should all appear in the
        same place.

  Returns:
    The fixed results. Changes the input results list as well.
  """
  for r in results:
    q = r['responses'][0]['question'] # Do replacement in first question only
    m = re.search('\"Proceed to.*?\"', q)
    if m:
      q = q.replace(m.group(0), '\"Proceed to [URL]\"')
      r['responses'][0]['question'] = q

  return results
