from email.policy import default
import os
import time
import tempfile

from flask import Flask
from flask import request
from flask_cors import CORS

from ropes import logger, redis_client, pack_file_key, VIDEO_MIME_EXT
# from oss_service import OSSService

app = Flask(__name__)
CORS(app, resources=r"/*", supports_credentials=True)

app.config['MAX_CONTENT_LENGTH'] = 80 * 1024 * 1024

user_id = '8860f21aee324f9babf5bb1c771486c8'

@app.route("/upload/video", methods=['POST'])
def upload_video():
    
    file = request.files['file']

    if file.content_type not in VIDEO_MIME_EXT:
        return {'error': "unknown video mimetype {}".format(file.content_type)}

    timestamp = time.time()

    with tempfile.NamedTemporaryFile(delete=False) as tf:

        file.save(tf)

        redis_client.rpush(os.getenv('FILE_TO_UPLOAD_REDIS_KEY', \
            default='file_to_upload'), pack_file_key(user_id, tf.name[8:], timestamp, file.content_type))

    oss_key = user_id + '/' + str(timestamp) + '.' + VIDEO_MIME_EXT[file.content_type]

    redis_client.set(oss_key + ':progress', 0)

    # If you return a dict or list from a view, it will be converted to a JSON response.
    return {'oss_key' : oss_key}

@app.route("/upload/progress", methods=['GET'])
def upload_progress():

    progress = redis_client.get(request.args.get('oss_key', type=str, default='') + ':progress')

    if progress:
        progress = progress.decode('utf-8')
    else:
        progress = ''


    # If you return a dict or list from a view, it will be converted to a JSON response.
    return {'progress': progress}