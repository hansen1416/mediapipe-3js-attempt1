import os
import struct
import sys
import tempfile
import time

from ropes import logger, redis_client

def pack_file_key(user_id, filename, timestamp):
    
    return bytes.fromhex(user_id) + struct.pack('8s', filename) + struct.pack('<d', timestamp)

def unpack_file_key(bytes_str):

    return bytes_str[:16].hex(), struct.unpack('8s', bytes_str[16:24])[0].decode('utf-8')\
        , struct.unpack('<d', bytes_str[24:])[0] 

if __name__ == "__main__":

    user_id = '8860f21aee324f9babf5bb1c771486c8'

    with tempfile.NamedTemporaryFile(delete=True) as file:

        p = os.path.split(file.name)

        t = time.time()

        logger.info((user_id, p[-1][3:], t))

        r1= pack_file_key(user_id=user_id, \
            filename=p[-1][3:].encode('UTF-8'), timestamp=t)

        logger.info(sys.getsizeof(r1))

        logger.info(unpack_file_key(r1))
