"""Module resposible for main application logic."""

import os
from sys import argv
from typing import final, Self, Tuple, Dict, List
from dataclasses import dataclass, field

from flask import Flask, request
from flask.wrappers import Response
from werkzeug.utils import secure_filename
from werkzeug.exceptions import RequestEntityTooLarge

from backend.models import get_model_size
from backend.exceptions.model import ModelNotLoaded
from backend.exceptions.file_operations import (
    NoFileUploaded, WrongExtensionProvided, TooManyFilesUploaded, WrongFieldNameProvided
)


@final
@dataclass(slots=True)
class Application:
    """Class responsible for the application logic."""

    flask_app: Flask = field(init=False)

    @classmethod
    def from_cmd(cls, cmd_arguments: List[str]) -> Self:
        """Creates an instance of the class from the command line."""
        return cls()

    def __post_init__(self) -> None:
        """Initializes the class."""
        self.flask_app = self.config_flask()

    def config_flask(self) -> Flask:
        """Configure the Flask application."""

        app = Flask(__name__)
        app.config['UPLOAD_FOLDER'] = './modules/backend/models/'
        app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024 # 16MB
        app.config['ALLOWED_EXTENSIONS'] = frozenset({'.h5'})

        @app.after_request
        def after_request(response: Response) -> Response:
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response

        @app.get('/model/extension')
        def models_extensions() -> Dict:
            return {'extension': list(app.config['ALLOWED_EXTENSIONS'])}, 200

        @app.post('/model/upload')
        def models_upload() -> Tuple[Dict, int]:
            try:
                if len(request.files) == 0:
                    raise NoFileUploaded()

                if len(request.files) > 1:
                    raise TooManyFilesUploaded()

                file = request.files['model']
                if file is None:
                    raise WrongFieldNameProvided('model')

                extention: str = os.path.splitext(file.filename)[-1]
                if extention not in app.config['ALLOWED_EXTENSIONS']:
                    raise WrongExtensionProvided(extention)

                path = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(file.filename))
                file.save(path)

                return {'message': 'Model uploaded successfully', 'model_size': get_model_size(path)}, 200

            except RequestEntityTooLarge:
                return {'error': f'File too large, exeded the {app.config['MAX_CONTENT_LENGTH']} limit'}, 413

            except (NoFileUploaded, TooManyFilesUploaded, WrongFieldNameProvided, WrongExtensionProvided) as error:
                return {'error': str(error)}, 400

            except ModelNotLoaded as error:
                os.remove(error.path)
                return {'error': str(error)}, 400

        return app

    def run(self) -> None:
        """Runs the Flask application."""
        self.flask_app.run(debug=True, host='127.0.0.1', port=5000)


def main() -> None:
    """Main function."""
    app = Application.from_cmd(argv)
    app.run()

if __name__ == '__main__':
    main()
