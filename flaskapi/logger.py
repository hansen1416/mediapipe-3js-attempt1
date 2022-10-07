import logging
import sys

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