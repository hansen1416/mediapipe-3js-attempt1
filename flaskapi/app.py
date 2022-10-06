import os
import time
import tempfile

from flask import Flask
from flask import request
from flask_cors import CORS

from logger import logger
from oss_service import OSSService

app = Flask(__name__)
CORS(app, resources=r"/*", supports_credentials=True)

app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024

@app.route("/upload/video", methods=['POST'])
def upload_video():

    f = request.files['file']

    with tempfile.NamedTemporaryFile(delete=True) as file:
        f.save(file)

        logger.info(os.path.getsize(file.name))

        osssvc = OSSService()

        osssvc.simple_upload(file)

    # If you return a dict or list from a view, it will be converted to a JSON response.
    return {}