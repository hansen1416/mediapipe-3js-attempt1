import os
import time

from ropes import logger, redis_client, unpack_file_key, VIDEO_MIME_EXT
from oss_service import OSSService 


def upload_video(user_id, filename, timestamp, mimetype):
    
    oss_key = user_id + '/' + str(timestamp)
    # in linux system, tempfile name is like /tmp/tmp(random_string)
    filename = '/tmp/tmp' + filename

    oss_svc = OSSService()

    oss_svc.multi_part_upload(oss_key, filename, mimetype)


if __name__ == "__main__":

    oss_svc = OSSService()

    redis_key = os.getenv('FILE_TO_UPLOAD_REDIS_KEY', default='file_to_upload')

    while True:

        if redis_client.llen(redis_key):

            user_id, filename, timestamp, mimetype = unpack_file_key(redis_client.lpop(redis_key))

            upload_video(user_id, filename, timestamp, mimetype)

        else:
            logger.info("no file to upload")

        time.sleep(1)