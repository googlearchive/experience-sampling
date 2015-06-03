"""Export survey data to Cloud Storage.

This implements a new admin-only page that allows exporting survey data from
the App Engine Datastore into a file in Cloud Storage, for easy downloading.

Alternately, this can export the data from Datastore into a Spreadsheet in the
admin's Google Drive.
"""

import datetime
import gc
import json
import logging
import site
import time

site.addsitedir('lib')
import cloudstorage as gcs

from models import SurveyModel, OldDbSurveyModel
import webapp2

from google.appengine.api import background_thread
from google.appengine.ext import ndb
from google.appengine.api import runtime #DEBUG
from google.appengine.api import taskqueue

package = 'ChromeExperienceSampling'

EXPORT_PAGE_HTML = """\
<html>
  <body>
    <form action='/export' method='post'>
      <div><input type='submit' value='Start Export'></div>
    </form>
  </body>
</html>
"""


class ModelEncoder(json.JSONEncoder):
  """Some property types don't encode to JSON, so we explicitly handle them."""

  def default(self, obj):
    if isinstance(obj, datetime.datetime):
      return obj.isoformat()
    return json.JSONEncoder.default(self, obj)


class ExportPage(webapp2.RequestHandler):
  """Serves a form to add a taskqueue job to export data."""

  def get(self):
    self.response.write(EXPORT_PAGE_HTML)

  def post(self):
    taskqueue.add(url='/export/worker',
                  params={'filename': self.request.get('filename')})
    self.redirect('/export')


class ExportWorker(webapp2.RequestHandler):
  """Taskqueue worker to do the Datastore to Cloud Storage export.

  Can optionally take in a filename to use for the file in Cloud Storage.
  If not specified, it will use a default name plus the date and time.
  Repeatedly queries for more SurveyModel items from the Datastore, appending
  them one at a time to the export file in order to minimize memory usage.
  """

  def post(self):
    bucket_name = 'survey_responses'
    filename = self.request.get('filename')
    if not filename:
      time_string = time.strftime('%Y_%m_%d_%H%M%S_%Z')
      filename = '.'.join(['surveys', time_string, 'json'])

    def export_data(filename):
      logging.debug('Exporting data...') #DEBUG
      with gcs.open('/' + bucket_name + '/' + filename, 'w') as f:
        query = OldDbSurveyModel.all()
        logging.debug('ndb SurveyModel kind: %s' % SurveyModel._get_kind()) #DEBUG
        delim=''
        f.write('[')
        numpages = 0
        for record in query:
          numpages = numpages + 1 #DEBUG
          if (numpages % 10 == 0): #DEBUG
            logging.debug(
                'Pages/memory so far: %d %d' %
                (numpages, runtime.memory_usage().current())) #DEBUG

          ndb_record = ndb.Key.from_old_key(record.key()).get()
          f.write(delim)
          f.write(json.dumps(ndb_record.to_dict(), cls=ModelEncoder))
          delim = ',\n'
        f.write(']')
        f.close()

#         query = SurveyModel.all()
#         cursor = None
#         more = True
#         delim = ''
#         f.write('[')
# # #DEBUG        gc.set_debug(gc.DEBUG_STATS)
#         numpages = 0
#         while more:
#           records, cursor, more = query.fetch_page(50, start_cursor=cursor)
#           numpages = numpages + 1
#           if (numpages % 10 == 0): #DEBUG
#             logging.debug(
#                 'Pages/memory so far: %d %d' %
#                 (numpages, runtime.memory_usage().current())) #DEBUG
#           gc.collect()
#           for record in records:
#             f.write(delim)
#             f.write(json.dumps(record.to_dict(), cls=ModelEncoder))
#             f.flush()
#             delim = ',\n'
#         f.write(']')
#         f.close()

    tid = background_thread.start_new_background_thread(
        export_data, [filename])
#    export_data(filename)

APPLICATION = webapp2.WSGIApplication([
    ('/export/', ExportPage),
    ('/export', ExportPage),
    ('/export/worker', ExportWorker)
])
