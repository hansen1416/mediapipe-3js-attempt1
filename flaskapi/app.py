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

    file = request.files['file']

    if file.content_type not in VIDEO_MIME_EXT:
        return {'error': "unknown video mimetype {}".format(file.content_type)}

    timestamp = time.time()

    with NamedTemporaryFile(delete=False) as tf:

        file.save(tf)

        redis_client.rpush(os.getenv('FILE_TO_UPLOAD_REDIS_KEY',
                                     default='file_to_upload'), pack_file_key(user_id, tf.name[8:], timestamp, file.content_type))

    oss_key = user_id + '/' + str(timestamp) + \
        '.' + VIDEO_MIME_EXT[file.content_type]

    redis_client.set(oss_key + ':progress', 0)

    # If you return a dict or list from a view, it will be converted to a JSON response.
    return {'oss_key': oss_key}


@app.route("/upload/progress", methods=['GET'])
def upload_progress():

    progress = redis_client.get(request.args.get(
        'oss_key', type=str, default='') + ':progress')

    if progress:
        progress = progress.decode('utf-8')
    else:
        progress = ''

    # If you return a dict or list from a view, it will be converted to a JSON response.
    return {'progress': progress}


@app.route("/pose/stream", methods=['GET'])
def pose_stream():

    object_stream = oss_bucket().get_object(
        '8860f21aee324f9babf5bb1c771486c8/1665829847.0999663.mp4/wlm0-3000.npy')

    """
    ['_GetObjectResult__crc_enabled', '_GetObjectResult__crypto_provider', '__class__', '__delattr__', 
    '__dict__', '__dir__', '__doc__', '__enter__', '__eq__', '__exit__', '__format__', '__ge__', 
    '__getattribute__', '__gt__', '__hash__', '__init__', '__init_subclass__', '__iter__', '__le__', 
    '__lt__', '__module__', '__ne__', '__new__', '__reduce__', '__reduce_ex__', '__repr__', '__setattr__', 
    '__sizeof__', '__str__', '__subclasshook__', '__weakref__', '_parse_range_str', '_server_crc', 
    'client_crc', 'close', 'content_length', 'content_range', 'content_type', 'delete_marker', 'etag', 
    'headers', 'last_modified', 'object_type', 'read', 'request_id', 'resp', 'server_crc', 'status', 
    'stream', 'versionid']
    """

    # logger.info(dir(object_stream.stream))
    # logger.info(object_stream.content_length)

    def generate():
        for row in range(0, object_stream.content_length, 8*1024):
            yield object_stream.stream.next()
    return Response(generate(), mimetype='text/csv')


@app.route("/pose/data", methods=['GET'])
def pose_data():

    action_name = request.args.get('action_name')

    data = np.load(os.path.join(
        'tmp', 'wlmc{}.npy'.format(action_name)), allow_pickle=True)

    return {'data': data.tolist()}


@app.route("/pose/data2", methods=['GET'])
def pose_data2():

    action_name = request.args.get('action_name')

    data = np.load(os.path.join(
        'tmp', 'wlm{}.npy'.format(action_name)), allow_pickle=True)
    # data = np.load(os.path.join('tmp', 'wlm0-3000.npy'), allow_pickle=True)

    return {'data': data.tolist()}


@app.route("/pose/landmarks", methods=['GET'])
def pose_landmarks():

    action_name = request.args.get('action_name')

    # with open(os.path.join('tmp', 'wlm{}.npy'.format(action_name)), 'rb') as f:

    #     data = pickle.load(f)

    #     logger.info(data)

    data = np.load(os.path.join(
        'tmp', 'wlm{}.npy'.format(action_name)), allow_pickle=True)

    return {'data': data.tolist()}


@app.route("/pose/rotations", methods=['GET'])
def pose_rotations():

    data = pd.read_csv('./out_rotations.csv')

    for c in data.columns:
        # print(c)
        pass

    cols = ['lCollar.X', 'lCollar.Y', 'lCollar.Z', 'lShldr.X', 'lShldr.Y', 'lShldr.Z', 'lForeArm.X',
            'lForeArm.Y', 'lForeArm.Z', 'lHand.X', 'lHand.Y', 'lHand.Z', 'rShldr.X', 'rShldr.Y',
            'rShldr.Z', 'rForeArm.X', 'rForeArm.Y', 'rForeArm.Z', 'rHand.X', 'rHand.Y', 'rHand.Z',
            "rThigh.X",
            "rThigh.Y",
            "rThigh.Z",
            "rShin.X",
            "rShin.Y",
            "rShin.Z",
            "rFoot.X",
            "rFoot.Y",
            "rFoot.Z",
            "lThigh.X",
            "lThigh.Y",
            "lThigh.Z",
            "lShin.X",
            "lShin.Y",
            "lShin.Z",
            "lFoot.X",
            "lFoot.Y",
            "lFoot.Z",
            ]

    for c in cols:
        # logger.info(data[c])
        pass

    # logger.info(data[cols].to_dict())

    return data[cols].to_dict()
