import logging
import sys

# log to stdout
logging.basicConfig(stream=sys.stdout, level=logging.INFO)

logger = logging.getLogger()
