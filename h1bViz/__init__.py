import os

from flask import Flask, render_template

from h1bViz.api.petitions import bp as petitions_bp


def create_app(test_config=None):
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_mapping(SECRET_KEY='dev', DATABASE=os.path.join(app.instance_path, 'h1b.db'), )
    # app.config.from_mapping(SECRET_KEY='dev', DATABASE=os.path.join(app.instance_path, 'h1b_short.db'), )
    if test_config is None:
        app.config.from_pyfile('config.py', silent=True)
    else:
        app.config.from_mapping(test_config)

    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    @app.route('/')
    def hello():
        return render_template('index.html')

    app.register_blueprint(petitions_bp)

    return app
