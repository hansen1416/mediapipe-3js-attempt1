import os
import sys
import struct
import time
import redis

from logger import logger

# replace these dir to aliyun oss path
VIDEO_DIR = os.path.join('./', 'media')
POSE_DATA_DIR = os.path.join('./', 'tmp')

class VideoProcessor:

    def __init__(self) -> None:

        self.cache_expire_at = 3600 * 6

        self.redis_db = redis.Redis(host="localhost", port="6379", charset="utf-8")

    def subscriber(self):

        video_file = self.redis_db.get('video_to_process').decode('utf-8')

        if video_file:
            self.pose_npy_to_redis(video_filename=video_file)
        else:
            logger.info(__file__ + " nothing to process")

    def pose_npy_to_redis(self, video_filename):

        pose_npy = [f for f in os.listdir(POSE_DATA_DIR) if f.startswith(video_filename)]

        logger.info(pose_npy)


if __name__ == "__main__":

    vp = VideoProcessor()

    vp.redis_db.setex('video_to_process', 100, '6packs.mp4')

    while True:

        vp.subscriber()

        time.sleep(1)