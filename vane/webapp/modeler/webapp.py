from __future__ import absolute_import, print_function
import json
import logging
import os

from logging.handlers import RotatingFileHandler

from flask import Flask, request

from . import utils
# from .utils import analyze_network

# logger = logging.getLogger('vane_webapp')

log_file = os.path.join('logs', 'webapp.log')
log_file_max_size = 1024 * 1024 * 10 # megabytes
log_file_backup_count = 5

log_format = "%(asctime)s [%(levelname)s]: %(filename)s(%(funcName)s:%(lineno)s) >> %(message)s"

log_date_format = "%m/%d/%Y %I:%M:%S %p"
log_filemode = "a" # w: overwrite; a: append

# setup logger
# datefmt=log_date_format
logging.basicConfig(filename=log_file,
                    format=log_format,
                    filemode=log_filemode,
                    level=logging.DEBUG)

logFileHandler = RotatingFileHandler(log_file,
                                     maxBytes=log_file_max_size,
                                     backupCount=log_file_backup_count)

# print log messages to console
consoleHandler = logging.StreamHandler()
logFormatter = logging.Formatter(log_format)
consoleHandler.setFormatter(logFormatter)

# listens on localhost:5000 by default
app = Flask(__name__)

# loggers = [app.logger, logging.getLogger('root')]

# for logger in loggers:
#     logger.addHandler(logFileHandler)
#     logger.addHandler(consoleHandler)

logger = logging.getLogger('root')
logger.addHandler(logFileHandler)
# logger.addHandler(consoleHandler)

@app.route('/analyze', methods=["POST"])
def analyze_network():
    try:
        return json.dumps(utils.analyze_network(request.get_json()))
    except IOError as e:
        print(e)


@app.route('/export', methods=["POST"])
def export():
    try:
        return json.dumps(utils.export(request.get_json()))
    except IOError as e:
        print(e)


@app.route('/network-study', methods=["POST"])
def run_study():
    try:
        return json.dumps(utils.run_study(request.get_json()))
    except IOError as e:
        print(e)
