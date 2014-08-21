"""Export survey data to Cloud Storage.

This implements a new admin-only page that allows exporting survey data from
the App Engine Datastore into a file in Cloud Storage, for easy downloading.

Alternately, this can export the data from Datastore into a Spreadsheet in the
admin's Google Drive.
"""

import site
site.addsitedir("lib")

import cloudstorage as gcs
import gc
import json
import time
import webapp2

from models import SurveyModel

from google.appengine.api import taskqueue
from google.appengine.ext import ndb


EXPORT_PAGE_HTML = """\
<html>
  <body>
    <form action='/export' method='post'>
      <div><input type='submit' value='Start Export'></div>
    </form>
  </body>
</html>
"""


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
    bucket_name = "default"
    filename = self.request.get('filename')
    if not filename:
      time_string = time.strftime('%Y_%m_%d_%H%M%S_%Z')
      filename = '.'.join(['chrome-experience-sampling', time_string, 'csv'])

    def export_data(filename):
      with gcs.open("/" + bucket_name + "/" + filename, 'w') as f:
        query = SurveyModel.query()
        cursor = None
        more = True
        while more:
          records, cursor, more = query.fetch_page(50, start_cursor=cursor)
          gc.collect()
          for record in records:
            f.write(json.dumps(record.to_dict()))
    
    export_data(filename)

APPLICATION = webapp2.WSGIApplication([
    ('/export/', ExportPage),
    ('/export', ExportPage),
    ('/export/worker', ExportWorker)
], debug=True)

