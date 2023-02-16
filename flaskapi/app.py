from config import app
from models import *

from controller.user import UserController

app.register_blueprint(UserController)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
