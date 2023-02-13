import os
import time
from tempfile import NamedTemporaryFile

from flask import Flask, request, Response
from flask_cors import CORS
import numpy as np
import pandas as pd

from ropes import logger, redis_client, pack_file_key, VIDEO_MIME_EXT, oss_bucket
# from oss_service import OSSService

app = Flask(__name__)
CORS(app, resources=r"/*", supports_credentials=True)

app.config['MAX_CONTENT_LENGTH'] = 80 * 1024 * 1024

user_id = '8860f21aee324f9babf5bb1c771486c8'


@app.route("/upload/video", methods=['POST'])
def upload_video():
    return {}