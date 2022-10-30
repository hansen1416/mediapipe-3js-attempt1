import logging
import os
import sys
import redis
import struct

import oss2

from dotenv import load_dotenv

load_dotenv()

# log to stdout
# logging.basicConfig(stream=sys.stdout, level=logging.INFO)

formatter = logging.Formatter(fmt='%(asctime)s %(levelname)-8s %(message)s',
                                  datefmt='%Y-%m-%d %H:%M:%S')

screen_handler = logging.StreamHandler(stream=sys.stdout)
screen_handler.setFormatter(formatter)

logger = logging.getLogger()

if os.getenv('FLASK_DEBUG'):
    logger.setLevel(logging.DEBUG)
else:
    logger.setLevel(logging.INFO)

logger.addHandler(screen_handler)


redis_client = redis.Redis(host="localhost", port="6379", charset="utf-8")

VIDEO_MIME_EXT = {
    'video/x-msvideo': 'avi',
    'video/mp4': 'mp4',
    'video/mpeg': 'mpeg',
    'video/ogg': 'ogv',
    'video/mp2t': 'ts',
    'video/webm': 'webm',
}


def pack_file_key(user_id, filename, timestamp, mimetype):
    """
    Args:
        user_id: uuid;
        filename: NamedTemporaryFile.name
        timestamp: current time in milliseconds
        mimetype: video mimetype, random length string
    """

    return bytes.fromhex(user_id) + bytes(filename, 'utf-8') \
        + struct.pack('<d', timestamp) + bytes(mimetype, 'utf-8')


def unpack_file_key(bytes_str):
    """
    Return:
        uuid, NamedTemporaryFile.name, current time in milliseconds, video mimetype
    """

    return bytes_str[:16].hex(), bytes_str[16:24].decode('utf-8'), struct.unpack('<d', bytes_str[24:32])[0], bytes_str[32:].decode('utf-8')


def oss_bucket():

    # 阿里云账号AccessKey拥有所有API的访问权限，风险很高。强烈建议您创建并使用RAM用户进行API访问或日常运维，请登录RAM控制台创建RAM用户。
    auth = oss2.Auth(os.getenv('ALIYUN_ACCESS_ID'),
                     os.getenv('ALIYUN_ACCESS_SECRET'))
    # yourEndpoint填写Bucket所在地域对应的Endpoint。以华东1（杭州）为例，Endpoint填写为https://oss-cn-hangzhou.aliyuncs.com。
    # 填写Bucket名称。
    return oss2.Bucket(auth, os.getenv(
        'OSS_ENDPOINT'), os.getenv('OSS_BUCKET'))
