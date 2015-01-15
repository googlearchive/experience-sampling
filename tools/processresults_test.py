"""Unit tests for processing CUES results from raw JSON to CSV
"""

import datetime
import processresults
import unittest

class TestProcessResults(unittest.TestCase):
  
  def setUp(self):
    self.mock_results = [
        {
            u'date_received': u'2014-11-05T13:14:15.123456',
            u'date_taken': u'2014-11-05T01:02:03.789123',
            u'participant_id': u'P1',
            u'survey_type': 'ssl-overridable-proceed.js',
            u'responses': [
                {
                    u'answer': u'P1A1',
                    u'question':
                        u'blah "Proceed to exampleP1Q1.com:23" "blah" blah'
                },
                {u'answer': u'P1A2', u'question': u'Q2'},
                {u'answer': u'P1A3', u'question': u'Q3'},
                {
                    u'answer': u'P1AttributeCAnswer',
                    u'question':
                        u'To what degree do each of the following ' +
                        u'adjectives describe this page?(C)'
                },
                {
                    u'answer': u'P1AttributeAAnswer',
                    u'question':
                        u'To what degree do each of the following ' +
                        u'adjectives describe this page?(A)'
                },
                {
                    u'answer': u'P1AttributeBAnswer',
                    u'question':
                        u'To what degree do each of the following ' +
                        u'adjectives describe this page?(B)'
                },
                {u'answer': u'P1A4', u'question': u'Q7'},
            ]
        },
        {
            u'date_received': u'2015-01-05T12:02:12.687920',
            u'date_taken': u'2015-01-05T11:48:39.760000',
            u'participant_id': u'P2',
            u'survey_type': 'ssl-overridable-proceed.js',
            u'responses': [
                {
                    u'answer': u'P2A1',
                    u'question':
                        u'blah "Proceed to exampleP2Q1.com:23" "blah" blah'
                },
                {u'answer': u'P2A2', u'question': u'Q2'},
                {u'answer': u'P2A3', u'question': u'Q3'},
                {
                    u'answer': u'P2AttributeBAnswer',
                    u'question':
                        u'To what degree do each of the following ' +
                        u'adjectives describe this page?(B)'
                },
                {
                    u'answer': u'P2AttributeCAnswer',
                    u'question':
                        u'To what degree do each of the following ' +
                        u'adjectives describe this page?(C)'
                },
                {
                    u'answer': u'P2AttributeAAnswer',
                    u'question':
                        u'To what degree do each of the following ' +
                        u'adjectives describe this page?(A)'
                },
                {u'answer': u'P2A4', u'question': u'Q7'},
                {u'answer': u'www.example.com', u'question': u'URL'}
            ]
        },
        {
            u'date_received': u'2015-01-12T00:01:02.345678',
            u'date_taken': u'2015-01-05T00:00:00.123456',
            u'participant_id': u'P3',
            u'survey_type': 'ssl-overridable-proceed.js',
            u'responses': [
                {
                    u'answer': u'P3A1',
                    u'question':
                        u'blah "Proceed to exampleP3Q1.com:23" "blah" blah'
                },
                {u'answer': u'P3A2', u'question': u'Q2'},
                {u'answer': u'P3A3', u'question': u'Q3'},
                {
                    u'answer': u'P3AttributeAAnswer',
                    u'question':
                        u'To what degree do each of the following ' +
                        u'adjectives describe this page?(A)'
                },
                {
                    u'answer': u'P3AttributeBAnswer',
                    u'question':
                        u'To what degree do each of the following ' +
                        u'adjectives describe this page?(B)'
                },
                {
                    u'answer': u'P3AttributeCAnswer',
                    u'question':
                        u'To what degree do each of the following ' +
                        u'adjectives describe this page?(C)'
                },
                {u'answer': u'P3A4', u'question': u'Q7'}
            ]
        },
        {
            u'date_received': u'2014-11-05T13:14:15.123456',
            u'date_taken': u'2014-11-05T01:02:03.789123',
            u'participant_id': u'P4',
            u'survey_type': 'malware-noproceed.js',
            u'responses': [
                {
                    u'answer': u'P4A1',
                    u'question':
                        u'blah "Back to safety" "blah" blah'
                },
                {u'answer': u'P4A2', u'question': u'Q2'},
                {u'answer': u'P4A3', u'question': u'Q3'},
                {
                    u'answer': u'P4AttributeCAnswer',
                    u'question':
                        u'To what degree do each of the following ' +
                        u'adjectives describe this page?(C)'
                },
                {
                    u'answer': u'P4AttributeAAnswer',
                    u'question':
                        u'To what degree do each of the following ' +
                        u'adjectives describe this page?(A)'
                },
                {
                    u'answer': u'P4AttributeBAnswer',
                    u'question':
                        u'To what degree do each of the following ' +
                        u'adjectives describe this page?(B)'
                },
                {u'answer': u'P4A4', u'question': u'Q7'},
            ]
        },
        {
            u'date_received': u'2015-01-12T00:01:02.345678',
            u'date_taken': u'2015-01-05T01:02:03.123456',
            u'participant_id': u'P5',
            u'survey_type': 'malware-noproceed.js',
            u'responses': [
                {
                    u'answer': u'P5A1',
                    u'question': u'PLACEHOLDER'
                },
                {u'answer': u'P5A2', u'question': u'PLACEHOLDER'},
                {u'answer': u'P5A3', u'question': u'PLACEHOLDER'},
                {
                    u'answer': u'P5AttributeAAnswer',
                    u'question': u'PLACEHOLDER'
                },
                {
                    u'answer': u'P5AttributeBAnswer',
                    u'question': u'PLACEHOLDER'
                },
                {
                    u'answer': u'P5AttributeCAnswer',
                    u'question': u'PLACEHOLDER'
                },
                {u'answer': u'P5A4', u'question': u'PLACEHOLDER'}
            ]
        }          
    ]
    
  def test_DiscardResultsBeforeDate_filters_out_two_november_dates(self):
    results = self.mock_results
    results = processresults._DiscardResultsBeforeDate(
        results, datetime.datetime(2014, 12, 01, 0, 0, 0, 0))

    self.assertEqual(len(results), 3)
    self.assertEqual(results[0]['date_taken'], u'2015-01-05T11:48:39.760000')
    self.assertEqual(results[1]['date_taken'], u'2015-01-05T00:00:00.123456')
    self.assertEqual(results[2]['date_taken'], u'2015-01-05T01:02:03.123456')
    
  def test_FilterByCondition_filters_out_two_malware_noproceed(self):
    results = self.mock_results
    results = processresults._FilterByCondition('ssl-overridable-proceed',
                                                results)

    self.assertEqual(len(results), 3)
    self.assertEqual(results[0]['survey_type'], 'ssl-overridable-proceed.js')
    self.assertEqual(results[1]['survey_type'], 'ssl-overridable-proceed.js')
    self.assertEqual(results[2]['survey_type'], 'ssl-overridable-proceed.js')

  def test_CanonicalizeQuestions_filters_out_placeholder_questions(self):
    results = [r for r in self.mock_results
               if r['survey_type'] == 'malware-noproceed.js']
    processresults._CanonicalizeQuestions(results)

    self.assertEqual(len(results), 1)
    self.assertNotEqual(results[0]['responses'][0]['question'], 'PLACEHOLDER')
        
  def test_CanonicalizeQuestions_reorders_attribute_questions(self):
    results = [r for r in self.mock_results
               if r['survey_type'] == 'ssl-overridable-proceed.js']
    processresults._CanonicalizeQuestions(results)

    self.assertEqual(len(results), 3)
    for r in results:
      self.assertEqual(
          r['responses'][3]['question'],
          ('To what degree do each of the following adjectives '
          'describe this page?(A)'))
      self.assertEqual(
          r['responses'][4]['question'],
          ('To what degree do each of the following adjectives '
          'describe this page?(B)'))
      self.assertEqual(
          r['responses'][5]['question'],
          ('To what degree do each of the following adjectives '
          'describe this page?(C)'))            
    
  def test_CanonicalizeQuestions_replaces_urls_with_placeholder(self):
    results = [r for r in self.mock_results
               if r['survey_type'] == 'ssl-overridable-proceed.js']
    processresults._CanonicalizeQuestions(results)

    for r in results:
      self.assertEqual(
          r['responses'][0]['question'], 'blah "Proceed to [URL]" "blah" blah')    
  
  def test_CanonicalizeQuestions_returns_canonical_index(self):
    results = [r for r in self.mock_results
               if r['survey_type'] == 'ssl-overridable-proceed.js']
    canonical_index = processresults._CanonicalizeQuestions(results)

    # 2nd item (index 1) in mock_results should be selected as canonical
    self.assertEqual(canonical_index, 1)
  
  def test_CanonicalizeQuestions_raises_exception_on_nonequal_questions(self):
    results = self.mock_results
    self.assertRaises(processresults.QuestionError,
                      processresults._CanonicalizeQuestions, results)
                    
if __name__ == '__main__':
  unittest.main()
