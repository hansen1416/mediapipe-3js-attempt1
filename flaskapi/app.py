import os
import struct
import time
import tempfile

from flask import Flask
from flask import request
from flask_cors import CORS

from ropes import logger, redis_client
# from oss_service import OSSService

app = Flask(__name__)
CORS(app, resources=r"/*", supports_credentials=True)

app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024

@app.route("/upload/video", methods=['POST'])
def upload_video():

    user_id = '8860f21aee324f9babf5bb1c771486c8'
    
    f = request.files['file']

    with tempfile.NamedTemporaryFile(delete=False) as file:
        f.save(file)

        redis_client.rpush("file_to_upload", file.name)

    # If you return a dict or list from a view, it will be converted to a JSON response.
    return {}