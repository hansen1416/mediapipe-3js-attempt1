from genericpath import getsize
import os
import sys
import struct
import ctypes

import numpy as np
import pickle
import redis

from logger import logger


POSE_DATA_DIR = os.path.join('.', 'pose_data')

class PoseCache:

    def __init__(self) -> None:
        self.redis_db = redis.Redis(host="localhost", port="6379")

    def save_pose_to_cache(self):
        data = np.load(os.path.join(POSE_DATA_DIR, 'wlm0-3000.npy'))

        for i in range(data.shape[0]):

            self.redis_db.delete('yoga123456:' + str(i))

            pose = np.array([[wlm.x, wlm.y, wlm.z, wlm.visibility] \
                for wlm in pickle.loads(data[i]).landmark])

            pose1d = pose.reshape(-1).tolist()

            bstr = None

            for pf in pose1d:

                if bstr is None:
                    bstr = struct.pack('<f', pf)
                else:
                    bstr += struct.pack('<f', pf) #+ struct.pack('f', pose1d[1])

            logger.info(len(bstr))
            logger.info(sys.getsizeof(bstr))
            logger.info(type(bstr))

            logger.info(struct.unpack('f', bstr[4: 8]))

            self.redis_db.setex('yoga123456:' + str(i), 3600*7, bstr)


            break

            # pose1dstr = "".join(pose1d)

            # logger.info(sys.getsizeof())

            # self.redis_db.setex('yoga123456:' + str(i), 3600*7, poseby)

            # posebuf = (ctypes.c_float * len(pose1d))(*pose1d)

            # logger.info(posebuf)
            # logger.info(sys.getsizeof(posebuf))

            # logger.info(sys.getsizeof(poseby))
            # logger.info(sys.getsizeof(pose))

            poseby = bytes()

            logger.info(poseby)
            logger.info(sys.getsizeof(poseby))

            poseby = poseby.join([struct.pack("f", fl) for fl in pose1d])
            # posenpby = pose.tobytes()

            logger.info(sys.getsizeof(poseby))
            logger.info(poseby)
            # logger.info(sys.getsizeof(posenpby))

            self.redis_db.setex('yoga123456:' + str(i), 3600*7, poseby)
            self.redis_db.setex('yoga1234567:' + str(i), 3600*7, ",".join(map(str, pose1d)))

            break

    def read_pose_from_cache(self, video_key, frame_index):

        data_bytes = self.redis_db.get(video_key + ':' + str(frame_index))

        logger.info(sys.getsizeof(data_bytes))

        data_bytes = struct.unpack("<" + str(33*4) + 'f', data_bytes)

        # logger.info(data_bytes)

        data_bytes = np.array(list(data_bytes)).reshape(-1, 4)

        return data_bytes

        # logger.info(list(data_bytes))

        # pose_data = np.frombuffer(data_bytes)

        # return pose_data.reshape(-1, 4)

if __name__ == "__main__":

    pcache = PoseCache()

    pcache.save_pose_to_cache()

    exit()

    pose_data = pcache.read_pose_from_cache('yoga123456', 0)

    data_npy = np.load(os.path.join(POSE_DATA_DIR, 'wlm0-3000.npy'))

    pose_npy = np.array([[wlm.x, wlm.y, wlm.z, wlm.visibility] for wlm in pickle.loads(data_npy[0]).landmark])

    logger.info(pose_data)
    # logger.info(pose_npy.shape)
    logger.info(np.all(np.isclose(pose_data, pose_npy)))