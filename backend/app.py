from flask import Flask
from services.auricle import auricleService
from services.user import userService
from flask_socketio import SocketIO

app = Flask(__name__)
socketio = SocketIO(app)

# Register the blueprints
app.register_blueprint(auricleService, url_prefix='/auricle')
app.register_blueprint(userService, url_prefix='/users')

@app.route('/')
def hello():
    return 'Hello, World!'

if __name__ == "__main__":
    socketio.run(app, debug=True)
    app.run(debug=True)