import os

from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

SECRET_KEY = os.environ.get('SECRET_KEY')

app = Flask(__name__)
CORS(app, resources=r"/*", supports_credentials=True)

# upload limit size
app.config['MAX_CONTENT_LENGTH'] = 80 * 1024 * 1024
# used by jwt
app.config['SECRET_KEY'] = SECRET_KEY
# postgresql connection
app.config['SQLALCHEMY_DATABASE_URI'] = "postgresql://{user}:{pwd}@{host}:{port}/{dbname}"\
    .format(user=os.environ.get('DB_USERNAME'),
            pwd=os.environ.get('DB_PASSWORD'),
            host=os.environ.get('DB_HOST'),
            port=os.environ.get('DB_PORT'),
            dbname=os.environ.get('DB_NAME'))

# db migration
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False


db = SQLAlchemy(app)
migrate = Migrate(app, db)
