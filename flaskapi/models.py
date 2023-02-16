from config import db


class User(db.Model):
    """
    user auth table
    id, username, public_key, password, salt
    """

    user_id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(128))
    password = db.Column(db.String(255))
    publickey=db.Column(db.String(128))
    nonce=db.Column(db.String(128))

class Profile(db.Model):
    """
    user detailes
    user_id, more_info
    """
    user_id = db.Column(db.Integer, primary_key=True)

class Exercise(db.Model):
    """
    exercise info
    exercise_id, animation_file_s3_key
    """
    exercise_id = db.Column(db.Integer, primary_key=True)

class Training(db.Model):
    """
    training info
    training_id, name, duration
    """
    training_id = db.Column(db.Integer, primary_key=True)

class TrainingExercise(db.Model):
    """
    exercises in the training
    training_id, exercise_id
    """
    training_id = db.Column(db.Integer, primary_key=True)
    exercise_id = db.Column(db.Integer, primary_key=True)

class TrainingHistory(db.Model):
    """
    user's training history
    training_id, user_id
    """
    training_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, primary_key=True)