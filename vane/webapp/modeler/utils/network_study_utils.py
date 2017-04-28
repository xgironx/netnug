"""Network study functions."""
from __future__ import absolute_import, division, print_function

import logging
import numpy as np

from .data_utils import parse_json_network

logger = logging.getLogger('root')


__all__ = ['run_demand_failure_study']


def run_demand_failure_study(data):

    nodes, links, demands = parse_json_network(data.pop('network'))
    print(len(demands), 'network demands')

    selected_demands = data.pop("demands")
    print(len(selected_demands), 'selected demands for study')

    traffic_parameters = data.pop('trafficParameters')

    increase_traffic_by = traffic_parameters['key']

    traffic_amount = None
    initial_traffic_max_frac_multiplier = None

    if increase_traffic_by == 'constant':
        traffic_amount = traffic_parameters['value']
        print('traffic_amount: {}'.format(traffic_amount))
    elif increase_traffic_by == 'percent':
        initial_traffic_max_frac_multiplier = traffic_parameters['value'] / 100.
        print('initial_traffic_max_frac_multiplier: {}'.format(initial_traffic_max_frac_multiplier))
    else:
        raise ValueError('unknown value for `increase_traffic_by`: {}'.format(increase_traffic_by))

    def update_demand_traffic(demand):
        # print('updating demand {} traffic...'.format(demand.id))
        traffic = demand.traffic
        # print('traffic.dtype: {}'.format(traffic.dtype))
        # print("max_demand_traffic before increase: {}".format(np.amax(traffic[:, 1])))

        if initial_traffic_max_frac_multiplier is not None:
            initial_traffic_max = np.amax(demand.traffic0[:, 1])
            new_traffic = int(initial_traffic_max * initial_traffic_max_frac_multiplier)
        else:
            new_traffic = traffic_amount

        # print('new_traffic amountc: {}'.format(new_traffic))
        traffic[:, 1] += new_traffic

        # print("max_demand_traffic after increase: {}\n".format(np.amax(traffic[:, 1])))

        demand.traffic = traffic

    termination_conditions = data.pop('terminationConditions')
    print('termination conditions:\n{}'.format(termination_conditions))

    max_steps = None
    max_failed = None

    for condition in termination_conditions:
        if 'maxSteps' in condition:
            max_steps = condition['maxSteps']
        elif 'maxFailed' in condition:
            max_failed = condition['maxFailed']
        else:
            print('unknown termination condition: {}'.format(condition))

    print('max_steps: {}'.format(max_steps))
    print('max_failed: {}'.format(max_failed))

    def terminate(step, failed):
        condition1 = step == max_steps if max_steps is not None else False
        condition2 = failed >= max_failed if max_failed is not None else False
        return condition1 or condition2

    step = 0

    demands.generate_routes(nodes, links, algorithm='all_simple_paths')
    failed = demands.status_counter['unsatisfied']

    while not terminate(step, failed):
        step += 1
        print('step: {}'.format(step))

        demands.reset_routes()
        # demands.reset_statuses()

        for id in selected_demands:
            update_demand_traffic(demands.get(id))

        demands.generate_routes(nodes, links, algorithm='all_simple_paths')
        failed = demands.status_counter['unsatisfied']
        print(demands.status_counter)

    output_formats = data.pop('outputFormats')
    output_attributes = data.pop('outputAttributes')

    # return dict()
    return demands.results
