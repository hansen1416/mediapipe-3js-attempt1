import os
import time
import tempfile

from flask import Flask
from flask import request
from flask_cors import CORS

from logger import logger

app = Flask(__name__)
CORS(app, resources=r"/*", supports_credentials=True)

app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024

@app.route("/upload/video", methods=['POST'])
def upload_video():

    f = request.files['file']

    logger.info(f.name)

    # with tempfile.NamedTemporaryFile() as file:
    #     f.save('/var/www/uploads/uploaded_file.txt')

    # If you return a dict or list from a view, it will be converted to a JSON response.
    return {}