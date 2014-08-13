"""AppEngine Datastore models for the Chrome Experience Sampling backend.

These classes define the data models for form and survey responses.
"""

from google.appengine.ext import ndb


class Response(ndb.Model):
  question = ndb.StringProperty()
  answer = ndb.TextProperty()


class DemographicsForm(ndb.Model):
  participant_id = ndb.IntegerProperty(indexed=True)
  date_taken = ndb.DateTimeProperty()
  date_received = ndb.DateTimeProperty(auto_now_add=True)
  responses = ndb.StructuredProperty(Response, repeated=True)


class Survey(ndb.Model):
  participant_id = ndb.IntegerProperty(indexed=True)
  date_taken = ndb.DateTimeProperty()
  date_received = ndb.DateTimeProperty(auto_now_add=True)
  responses = ndb.StructuredProperty(Response, repeated=True)


