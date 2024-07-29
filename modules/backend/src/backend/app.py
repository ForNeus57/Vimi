"""Module resposible for main application logic."""

import os
from typing import final, Self, Tuple, Dict
from dataclasses import dataclass, field

from flask import Flask, request
from werkzeug.utils import secure_filename
from werkzeug.exceptions import RequestEntityTooLarge

from backend.models import get_model_size
from backend.exceptions.model import ModelNotLoaded


@final
@dataclass(slots=True)
class Application:
    """Class responsible for the application logic."""

    flask_app: Flask = field(init=False)

    @classmethod
    def from_cmd(cls) -> Self:
        """Creates an instance of the class from the command line."""
        return cls()

    def __post_init__(self) -> None:

        self.flask_app = self.config_flask()

    def config_flask(self) -> Flask:
        """Configure the Flask application."""

        app = Flask(__name__)
        app.config['UPLOAD_FOLDER'] = './modules/backend/models/'
        app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024 # 16MB
        app.config['ALLOWED_EXTENSIONS'] = frozenset({'.h5'})

        @app.after_request
        def after_request(response):
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response

        @app.post('/models/upload')
        def models_upload() -> Tuple[Dict, int]:
            try:
                file = request.files['model']
                if file is None:
                    return {'error': 'No file uploaded'}, 400

                extention: str = os.path.splitext(file.filename)[-1]
                if extention not in app.config['ALLOWED_EXTENSIONS']:
                    return {'error': f'File extention {extention} not allowed'}, 400

                path = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(file.filename))

                file.save(path)
                return {'message': 'Model uploaded successfully', 'model_size': get_model_size(path)}

            except RequestEntityTooLarge:
                return {'error': f'File too large, exeded the {app.config['MAX_CONTENT_LENGTH']} limit'}, 413

            except ModelNotLoaded as error:
                os.remove(error.path)
                return {'error': 'File is not the correct format'}, 400

        return app

    def run(self) -> None:
        """Runs the Flask application."""
        self.flask_app.run(debug=True, host='127.0.0.1', port=5000)


def main() -> None:
    """Main function."""
    app = Application.from_cmd()
    app.run()

if __name__ == '__main__':
    main()
