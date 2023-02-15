import os
import time
from tempfile import NamedTemporaryFile

from flask import Flask, request, Response
from flask_cors import CORS
import numpy as np
import pandas as pd

from controller.user import UserController

from ropes import logger, redis_client, pack_file_key, VIDEO_MIME_EXT, oss_bucket
# from oss_service import OSSService

SECRET_KEY = os.environ.get('SECRET_KEY')

app = Flask(__name__)
CORS(app, resources=r"/*", supports_credentials=True)

app.config['MAX_CONTENT_LENGTH'] = 80 * 1024 * 1024

app.config['SECRET_KEY'] = SECRET_KEY

user_id = '8860f21aee324f9babf5bb1c771486c8'


app.register_blueprint(UserController)