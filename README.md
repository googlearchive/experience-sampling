Google Chrome Experience Sampling Platform
==========================================

This repository houses the AppEngine backend and the Chrome extension for the
Chrome Experience Sampling Platform.


Backend: Setup and deployment
-----------------------------

- Make sure you have the
  [Google App Engine Python SDK](https://developers.google.com/appengine/downloads)
  installed and in your path

- Install the
  [App Engine GCS Client Libary](https://developers.google.com/appengine/docs/python/googlecloudstorageclient/download)
  into the backend
  
  If you use pip:
  `pip install -t backend/lib GoogleAppEngineCloudStorageClient`

  You should end up with a folder named "cloudstorage" under backend/.

- To run the development server:

  `dev_appserver.py backend/`

- To deploy the backend to App Engine:

  `appcfg.py update backend/app.yaml`

