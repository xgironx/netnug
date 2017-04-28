from __future__ import absolute_import, division, print_function

import json
import logging
import nose
from nose.tools import assert_equal, assert_true

import networkx as nx

from modeler.testing import NetworkStudyTestFixture
from modeler.classes import Nodes, Links, Demands, Subnet
from modeler.utils import run_demand_failure_study, write_json

# logging.basicConfig(filename='test.log',
#                     filemode='w', level=logging.INFO)


class Tests(NetworkStudyTestFixture):

    def test1(self):
        # study_data = self.demand_failure_study_data
        study_data = self.get_demand_failure_study_data('constant')
        results = run_demand_failure_study(study_data)
        write_json(results, 'demand_failure_study-test1.json')
        # print(results)


    def test2(self):
        study_data = self.get_demand_failure_study_data('percent')
        results = run_demand_failure_study(study_data)
        write_json(results, 'demand_failure_study-test2.json')


if __name__ == '__main__':
    nose.runmodule()
