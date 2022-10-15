import os
import struct
import sys
import tempfile
import time

from ropes import logger, redis_client, unpack_file_key
from oss_service import OSSService 


def upload_video(user_id, filename, timestamp):
    
    oss_key = user_id + '/' + str(timestamp)
    # in linux system, tempfile name is like /tmp/tmp(random_string)
    filename = '/tmp/tmp' + filename

    oss_svc = OSSService()

    oss_svc.multi_part_upload(oss_key, filename)


if __name__ == "__main__":

    oss_svc = OSSService()

    while True:

        if redis_client.llen('file_to_upload'):

            user_id, filename, timestamp = unpack_file_key(redis_client.lpop('file_to_upload'))

            upload_video(user_id, filename, timestamp)

        else:
            logger.info("no file to upload")

        time.sleep(1)