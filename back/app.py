from flask import Flask, jsonify, render_template, session, redirect, url_for
from functools import wraps
from flask_cors import CORS
from route.fogazza_route import fogazza_bp
from route.atendimento_route import atendimento_bp

app = Flask(__name__)

app.register_blueprint(fogazza_bp)
app.register_blueprint(atendimento_bp)

if __name__ == '__main__':
    app.run(debug=True)
