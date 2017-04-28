"""Webapp helper functions."""
from __future__ import absolute_import, print_function

import logging

logger = logging.getLogger('root')

from .data_utils import generate_network
# from .io_utils import write_json
from .network_study_utils import run_demand_failure_study

__all__ = ['analyze_network', 'export', 'run_study']


def analyze_network(data):
    """Analyze network data."""
    return generate_network(data).satisfy_demands(return_results=True,
                                                  algorithm='all_simple_paths')


def export(data):
    pass


def run_study(data):
    """Parse study parameters from JSON data and return dict of results."""
    study_type = data.pop('studyType')
    if study_type == 'Demand Failure':
        return run_demand_failure_study(data)
    else:
        raise ValueError('Unknown study type: {}'.format(study_type))
