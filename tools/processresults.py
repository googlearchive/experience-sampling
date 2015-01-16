"""Functions for processing CUES data in AppEngine JSON format into CSV format

Has one public function, ProcessResults, used like this from interpreter:
    ProcessResults('2015-01-06cuesDogfoodData.json', '2015-01-06-')
"""

import csv
from datetime import datetime
import json
import re

DATE_FORMAT = '%Y-%m-%dT%H:%M:%S'
DOGFOOD_START_DATE = datetime(2014, 12, 01, 0, 0, 0, 0)
CONDITIONS = [
    'ssl-overridable-proceed', 'ssl-overridable-noproceed',
    'ssl-nonoverridable', 'malware-proceed', 'malware-noproceed',
    'phishing-proceed', 'phishing-noproceed', 'extension-proceed',
    'extension-noproceed']
ATTRIBUTE_QUESTION_PREFIX = 'To what degree do each of the following'

def ProcessResults(json_in_file, csv_prefix):
  """Take results from AppEngine JSON file, process, and write to CSV file.

  Results from the input JSON file will be filtered into the 9 experimental
  conditions and written to CSV output files named in the format
  <csv_prefix><condition>.csv. CSV column headers will be the meta data fields
  date_received, date_taken, participant_id, and survey_type, plus the
  questions asked of the participant (with [URL] replacing actual URLs in the
  question text). Responses where questions were replaced with PLACEHOLDER
  will be ignored and not copied to the CSV file.

  Args:
    json_in_file: File with raw AppEngine results in JSON format
    csv_prefix: Prefix to output CSV files. These files will be named
        in the format <csv_prefix><condition>.csv. For example, if
        csv_prefix is '2015-01-15-' then one output file would be
        named 2015-01-15-ssl-overridable-proceed.csv

  Returns:
    None
  """
  parsed_events = _ParseSurveyResults(json_in_file)
  parsed_events = _DiscardResultsBeforeDate(parsed_events, DOGFOOD_START_DATE)

  for c in CONDITIONS:
    try:
      filtered_results = _FilterByCondition(c, parsed_events)
      canonical_index = _CanonicalizeQuestions(filtered_results)
      _WriteToCsv(filtered_results, canonical_index, csv_prefix + c + '.csv')
    # Print UnexpectedFormatException and continue, since they are usually
    # due to lack of data for a condition.
    except UnexpectedFormatException as e:
      print 'Exception in %s: %s' % (c, e.value)
  
def _ParseSurveyResults(in_file):
  with open(in_file, 'r') as json_file:
    s = json_file.read()
  parsed = _ParseJsonObjects(s)
  events = filter(lambda x: x['survey_type'] != 'setup.js', parsed)
  return events
  
def _ParseJsonObjects(s):
  decoder = json.JSONDecoder()
  objs = []
  end = 0
  while end < len(s) and end != -1:
    obj, end = decoder.raw_decode(s, idx=end)
    objs.append(obj)
    end = s.find('{', end)
  return objs

def _DiscardResultsBeforeDate(results, date):
  """Return a list of results that occur after the given date.

  Args:
    results: Results parsed from a raw JSON file into list of dicts
    date: A date of type datetime.datetime
    
  Returns:
    List of results whose date_taken value comes after the given date.
  """
  return [
    r for r in results
    if datetime.strptime(r['date_taken'].split('.')[0], DATE_FORMAT) >= date]

def _FilterByCondition(cond, results):
  """Return a list of results for the given condition only.

  Args:
    cond: Condition to filter on; e.g., 'ssl-overridable-proceed',
      'malware-noproceed', etc.
    results: Results parsed from raw JSON file into list of dicts

  Returns:
    List of results for the given condition.

  Raises:
    ValueError: A unrecognized condition was passed in.
  """
  if cond not in CONDITIONS:
    raise ValueError(cond + ' is not a valid condition')

  return [pr for pr in results if pr['survey_type'] == cond + '.js']


class QuestionError(BaseException):
  def __init__(self, value):
    BaseException.__init__(self, value)
    self.value = value
  def __str__(self):
    return(repr(self.value))


class UnexpectedFormatException(BaseException):
  def __init__(self, value):
    BaseException.__init__(self, value)
    self.value = value
  def __str__(self):
    return(repr(self.value))


def _CanonicalizeQuestions(results):
  """Apply various fixes to questions in results

  To write a set of survey responses to a CSV file, we need the questions
  to look the same for each response, so we can match answers to each other.
  But questions can differ from survey to survey, even within a condition,
  because:
    -- some questions were replaced with PLACEHOLDER in early dogfood versions
    -- attribute questions are presented in randomized order
    -- sometimes domains in the first question were supposed to be replaced
           by a placeholder but weren't
    -- some question lists are longer than others because the participant
           gave consent to collect URL and the URL was sent back as an extra
           question
  This function modifies results to fix these issues as follows:
    -- eliminates responses where questions that were replaced with PLACEHOLDER
    -- within each response, sorts attribute questions alphabetically
    -- replaces domains in first questions with [URL]
    -- question lists stay their original length, but a list of max length
           is selected as a canonical list for use as CSV headers
  The function does some light error checking to flag unexpected differences
  in questions.

  Args:
    results: List of results, where each result is a dict
      containing metadata and response data from a survey response.
      The results list should be filtered for one condition.

  Returns:
    Integer index into the results list indicating which list
    element's questions can be considered canonical and complete.
    Also modifies the input results to canonicalize all questions.

  Raises:
    QuestionError: A question in some response didn't match the expected
        canonical version of the question
    UnexpectedFormatError: Either results has no responses or all
        responses use PLACEHOLDER as the text for all questions
  """
  # Find responses that didn't use 'PLACEHOLDER' as the text for every question
  results[:] = [r for r in results
                      if r['responses'][0]['question'] != 'PLACEHOLDER']
  if not results:
    raise UnexpectedFormatException('No results with questions found')

  _ReorderAttributeQuestions(results)

  _ReplaceUrlWithPlaceholder(results)

  # Any response with the max number of questions should now be fine as
  # the canonical list of questions; find one such response.
  max_list_len = len(results[0]['responses'])
  canonical_index = 0
  for i, r in enumerate(results):
    if len(r['responses']) > max_list_len:
      max_list_len = len(r['responses'])
      canonical_index = i

  # Do some light error checking; all questions lists should now be the same,
  # except some question lists may have extra questions. So, check each list
  # of questions against the canonical list of questions.
  for i, qa_pair in enumerate(
      results[canonical_index]['responses']):
    for j, r in enumerate(results):
      if i < len(r['responses']):
        if (qa_pair['question'] != r['responses'][i]['question']):
          raise QuestionError(
              'Question text differs: Result %d question %d is {%s}. Result '
              '%d question %d is {%s}.'
              % (canonical_index, i, qa_pair['question'],
                 j, i, r['responses'][i]['question']))

  return canonical_index

def _WriteToCsv(results, canonical_index, out_file):
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
    canonical_index: Index of element in results whose questions can
        be considered canonical for use as CSV column headers.
    out_file: CSV file to write output to.

  Returns:
    None.
  """
  canonical_questions = [
      qa_pair['question']
      for qa_pair in results[canonical_index]['responses']]

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

def _ReorderAttributeQuestions(results):
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
    The altered results. Modifies the input results list as well.

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
    if index_list != range(min_index, max_index+1): # Check for consecutive
      raise UnexpectedFormatException(
          'indices in list %d not consecutive' % (i))

  for r in results:
    r['responses'][min_index:max_index+1] = sorted(
        r['responses'][min_index:max_index+1],
        key=lambda x: x['question'])

  return results

def _ReplaceUrlWithPlaceholder(results):
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
