import os
import time
import tempfile

from flask import Flask
from flask import request

from logger import logger

app = Flask(__name__)

@app.route("/")
def hello_world():

    f = request.files['the_file']

    logger.info(f.name)

    with tempfile.NamedTemporaryFile() as file:
        f.save('/var/www/uploads/uploaded_file.txt')

    return ""