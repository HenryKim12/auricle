from flask import Flask
from services.auricle import auricle_service
from flask_cors import CORS

app = Flask(__name__)

CORS(app)
CORS(app, origins=["http://localhost:5173/"])

app.config['MAX_CONTENT_LENGTH'] = 26836840000000
app.config['MAX_FORM_MEMORY_SIZE'] = 26836840000000

app.register_blueprint(auricle_service, url_prefix='/auricle')

@app.route('/')
def hello():
    return 'Hello, World!'

if __name__ == "main":
    app.run(debug=True)