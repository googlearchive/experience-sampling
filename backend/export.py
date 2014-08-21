"""Export survey data to Cloud Storage.

This implements a new admin-only page that allows exporting survey data from
the App Engine Datastore into a file in Cloud Storage, for easy downloading.

Alternately, this can export the data from Datastore into a Spreadsheet in the
admin's Google Drive.
"""

import datetime
import gc
import json
import site
import time

site.addsitedir('lib')

import cloudstorage as gcs
import webapp2

from models import SurveyModel

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

  def get(self):
    self.response.write(EXPORT_PAGE_HTML)

  def post(self):
    # Add a task to export the data to Cloud Storage.
    taskqueue.add(url='/export/worker',
                  params={'filename': self.request.get('filename')})
    self.redirect('/export')


class ExportWorker(webapp2.RequestHandler):

  def post(self):
    bucket_name = 'survey_responses'
    filename = self.request.get('filename')
    if not filename:
      time_string = time.strftime('%Y_%m_%d_%H%M%S_%Z')
      filename = '.'.join(['surveys', time_string, 'json'])

    def export_data(filename):
      with gcs.open('/' + bucket_name + '/' + filename, 'w') as f:
        query = SurveyModel.query()
        cursor = None
        more = True
        delim = ''
        while more:
          records, cursor, more = query.fetch_page(50, start_cursor=cursor)
          gc.collect()
          for record in records:
            f.write(delim)
            f.write(json.dumps(record.to_dict(), cls=ModelEncoder))
          delim = ',\n'

    export_data(filename)

APPLICATION = webapp2.WSGIApplication([
    ('/export/', ExportPage),
    ('/export', ExportPage),
    ('/export/worker', ExportWorker)
], debug=True)

