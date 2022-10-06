import os
import sys
import struct
import time
import redis

from logger import logger

class VideoProcessor:

    def __init__(self) -> None:
        self.redis_db = redis.Redis(host="localhost", port="6379", charset="utf-8")

    def subscriber(self):

        video_file = self.redis_db.get('video_to_process')

        if video_file:
            pass
        else:
            logger.info(__file__ + " nothing to process")



if __name__ == "__main__":

    vp = VideoProcessor()

    while True:

        vp.subscriber()

        time.sleep(1)