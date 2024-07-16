"""Main entrypoint for the application backend."""

import os
from flask import Flask, request
from werkzeug.utils import secure_filename
from werkzeug.exceptions import RequestEntityTooLarge

from backend.models import get_model_size
from backend.exceptions.model import ModelNotLoaded

def main() -> None:
    """Main function."""

    app = Flask(__name__)
    app.config['UPLOAD_FOLDER'] = './modules/backend/models/'
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024 # 16MB
    app.config['ALLOWED_EXTENSIONS'] = {'.h5'}

    @app.route('/models/upload', methods=['POST'])
    def models_upload():
        try:
            file = request.files['model']
            if file is None:
                return {'message': 'No file uploaded'}, 400

            extention = os.path.splitext(file.filename)[-1]
            if extention not in app.config['ALLOWED_EXTENSIONS']:
                return {'message': f'File extention {extention} not allowed'}, 400

            path = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(file.filename))

            file.save(path)
            return {'message': 'Model uploaded successfully', 'model_size': get_model_size(path)}

        except RequestEntityTooLarge:
            return {'message': f'File too large, exeded the {app.config['MAX_CONTENT_LENGTH']} limit'}, 413

        except ModelNotLoaded:
            os.remove(path)
            return {'message': 'File is not the correct format'}, 400

    app.run(debug=True, host='127.0.0.1', port=8080)

if __name__ == '__main__':
    main()
