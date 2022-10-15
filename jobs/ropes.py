import logging
import sys
import redis
import struct

from dotenv import load_dotenv

load_dotenv()

# log to stdout
# logging.basicConfig(stream=sys.stdout, level=logging.INFO)

formatter = logging.Formatter(fmt='%(asctime)s %(levelname)-8s %(message)s',
                                  datefmt='%Y-%m-%d %H:%M:%S')

screen_handler = logging.StreamHandler(stream=sys.stdout)
screen_handler.setFormatter(formatter)

logger = logging.getLogger()

logger.setLevel(logging.DEBUG)
logger.addHandler(screen_handler)


redis_client = redis.Redis(host="localhost", port="6379", charset="utf-8")


def pack_file_key(user_id, filename, timestamp):
    """
    Args:
        user_id: uuid;
        filename: NamedTemporaryFile.name
        timestamp: current time in milliseconds
    """
    
    return bytes.fromhex(user_id) + struct.pack('8s', filename) + struct.pack('<d', timestamp)


def unpack_file_key(bytes_str):
    """
    Return:
        uuid, NamedTemporaryFile.name, current time in milliseconds
    """

    return bytes_str[:16].hex(), struct.unpack('8s', bytes_str[16:24])[0].decode('utf-8')\
        , struct.unpack('<d', bytes_str[24:])[0]