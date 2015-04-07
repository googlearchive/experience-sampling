"""Functions for processing CUES data in AppEngine JSON format into CSV format

Has one public function, ProcessResults, used like this from interpreter:
    ProcessResults('2015-01-06cuesDogfoodData.json', '2015-01-06-')
"""

import csv
import dateutil.parser
from datetime import datetime
import json
import re

DOGFOOD_START_DATE = datetime(2014, 12, 01, 0, 0, 0, 0)
DEMOGRAPHIC_STABLE_DATE = datetime(2014, 12, 18, 0, 0, 0, 0)
DEMOGRAPHIC_CSV_PREFIX = 'demographics'
CONDITIONS = [
    'ssl-overridable-proceed', 'ssl-overridable-noproceed',
    'ssl-nonoverridable', 'malware-proceed', 'malware-noproceed',
    'phishing-proceed', 'phishing-noproceed', 'extension-proceed',
    'extension-noproceed']
TECHFAMILIAR_QUESTION_PREFIX = ('How familiar are you with each of the '
    'following computer and Internet-related items? I have...')
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
  demo_results, parsed_events = _ParseSurveyResults(json_in_file)

  demo_results, demo_index = _FilterDemographicResults(
      demo_results, DEMOGRAPHIC_STABLE_DATE)
  _WriteToCsv(demo_results, demo_index, csv_prefix +
              DEMOGRAPHIC_CSV_PREFIX + '.csv')

  parsed_events = _DiscardResultsBeforeDate(parsed_events, DOGFOOD_START_DATE)

  for c in CONDITIONS:
    try:
      filtered_results = _FilterByCondition(c, parsed_events)
      filtered_results, canonical_index = _CanonicalizeQuestions(
          filtered_results)
      _WriteToCsv(filtered_results, canonical_index, csv_prefix + c + '.csv')
    except UnexpectedFormatException as e:
      # Print UnexpectedFormatException and continue, since they are usually
      # due to lack of data for a condition.
      print 'Exception in %s: %s' % (c, e.value)


def _ParseSurveyResults(in_file):
  with open(in_file, 'r') as json_file:
    parsed = json.load(json_file)
  demographic = filter(lambda x: x['survey_type'] == 'setup.js', parsed)
  events = filter(lambda x: x['survey_type'] != 'setup.js', parsed)
  return demographic, events
  

def _FilterDemographicResults(demo_res, discard_before_date):
  """Return a list of results that occur after the given date, that
    don't use 'PLACEHOLDER' as the text for every question, and that
    have their techFamiliar questions arranged in canonical (alphabetical)
    order.

  Args:
    parsed_demo: Results from demographic survey parsed from a raw JSON
      file into list of dicts
    discard_before_date: A date of type datetime.datetime; demographic
      survey results before this date will be discarded
    
  Returns:
    (1) List of filtered demographic results, filtering out
    results with PLACEHOLDER for every question or whose date_taken comes
    before the given date. Also reorders the techFamiliar questions
    into canonical order.
    (2) Integer index into the results list indicating which list
    element's questions can be considered canonical and complete.
  """
  filtered_results = _DiscardResultsBeforeDate(demo_res, discard_before_date)

  # Find responses that didn't use 'PLACEHOLDER' as the text for every question
  filtered_results = [
      r for r in filtered_results
      if r['responses'][0]['question'] != 'PLACEHOLDER']

  _ReorderAttributeQuestions(filtered_results, TECHFAMILIAR_QUESTION_PREFIX)
  
  # Any response with the max number of questions should now be fine as
  # the canonical list of questions; find one such response.
  max_list_len = len(filtered_results[0]['responses'])
  canonical_index = 0
  for i, r in enumerate(filtered_results):
    if len(r['responses']) > max_list_len:
      max_list_len = len(r['responses'])
      canonical_index = i

  return filtered_results, canonical_index


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
      if dateutil.parser.parse(r['date_taken']) >= date]


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
    (1) List of results fixed to canonicalize all questions
    (2) Integer index into the results list indicating which list
    element's questions can be considered canonical and complete.

  Raises:
    QuestionError: A question in some response didn't match the expected
        canonical version of the question
    UnexpectedFormatError: Either results has no responses or all
        responses use PLACEHOLDER as the text for all questions
  """
  # Find responses that didn't use 'PLACEHOLDER' as the text for every question
  fixed_results = [r for r in results
                      if r['responses'][0]['question'] != 'PLACEHOLDER']
  if not fixed_results:
    raise UnexpectedFormatException('No results with questions found')

  _ReorderAttributeQuestions(fixed_results, ATTRIBUTE_QUESTION_PREFIX)

  _ReplaceUrlWithPlaceholder(fixed_results)

  # Any response with the max number of questions should now be fine as
  # the canonical list of questions; find one such response.
  max_list_len = len(fixed_results[0]['responses'])
  canonical_index = 0
  for i, r in enumerate(fixed_results):
    if len(r['responses']) > max_list_len:
      max_list_len = len(r['responses'])
      canonical_index = i

  # Do some light error checking; all questions lists should now be the same,
  # except some question lists may have extra questions. So, check each list
  # of questions against the canonical list of questions.
  for i, qa_pair in enumerate(
      fixed_results[canonical_index]['responses']):
    for j, r in enumerate(fixed_results):
      if i < len(r['responses']):
        if qa_pair['question'] != r['responses'][i]['question']:
          raise QuestionError(
              'Question text differs: Result %d question %d is {%s}. Result '
              '%d question %d is {%s}.'
              % (canonical_index, i, qa_pair['question'],
                 j, i, r['responses'][i]['question']))

  return fixed_results, canonical_index


def _WriteToCsv(results, canonical_index, out_file):
  """Write results for a given condition to a CSV file

  Given a list of results in the expected format, writes
  date_received, date_taken, participant_id, survey_type, and
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

  # Use the Python csv library to write to csv format. Our input data
  # had survey questions and answers grouped under the 'responses' key, but we
  # want to expand the 'responses' into question/answer pairs, so
  # that each question gets its own column in the output CSV file. So, we put
  # the data in the desired form, open the CSV file, and write it out.
  results_for_csv_writer = []
  for r in results:
    dict_for_csv_writer = {}
    for qa_pair in r['responses']:
      dict_for_csv_writer[qa_pair['question']] = (
          qa_pair['answer'].encode('utf-8'))
    dict_for_csv_writer.update(r)
    del dict_for_csv_writer['responses']
    results_for_csv_writer.append(dict_for_csv_writer)

  field_names = ['date_received', 'date_taken', 'participant_id',
      'survey_type']
  field_names.extend(canonical_questions)
  with open(out_file, 'w') as csv_file:
    csv_writer = csv.DictWriter(csv_file, field_names)
    csv_writer.writeheader()
    csv_writer.writerows(results_for_csv_writer)


def _ReorderAttributeQuestions(results, question_prefix):
  """Alphabetize attribute questions

  Attribute-type questions, like the tech familiarity questions in
  the demographic survey or the attribute questions in event surveys,
  are presented in random order, so we need to reorder them into a
  canonical order for the output CSV file. This uses alphabetical order
  as canonical order.

  Args:
    results: A list of dicts containing parsed and filtered results.
        It is assumed that results has been filtered for a given survey
        condition, such that attributes questions should all appear in the
        same place.
    question_prefix: A string that uniquely defines the attribute questions
        to be reordered. A question in the results will be considered an
        attribute question to be reordered iff it starts with question_prefix.
        
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
      if question_prefix in qa_pair['question']:
        index_list.append(i)
    attribute_question_indices.append(index_list)

  # Do some error checking; attribute questions should have the same indices
  # for all results and should appear consecutively. Since they should be the
  # same for all results, we grab the min and max index from the first result.
  if not attribute_question_indices:
    raise UnexpectedFormatException('Attributes questions not found.')
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
  """Fix a bug by replacing domain names with placeholders
    
  There was a bug in early dogfood versions of the survey extension
  in which URLs were included in questions where they
  were supposed to have a placeholder. The fix was to replace text like
  "Proceed to www.example.com" with "[CHOSEN]", and "Back to safety."
  with "[ALTERNATIVE]."
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
    chosenMatch = re.search('\"Proceed to.*?\"', q)
    alternateMatch = re.search('\"Back to safety\.\"', q)
    if chosenMatch:
      q = q.replace(chosenMatch.group(0), '\"[CHOSEN]\"')
    if alternateMatch:
      q = q.replace(alternateMatch.group(0), '\"[ALTERNATIVE].\"')
    r['responses'][0]['question'] = q

  return results
