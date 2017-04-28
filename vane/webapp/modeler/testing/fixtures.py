from __future__ import absolute_import, division, print_function

# from pkg_resources import resource_filename

# import logging
import os
import unittest

import numpy as np

from modeler import datadir
from modeler.classes import Demand, Node, Subnet, Link
from modeler.utils import generate_network, load_json

__all__ = ['TempfileTestFixture', 'NetworkTestFixture',
           'NetworkStructuresTestFixture', 'NetworkStudyTestFixture']


# test_logger = logging.getLogger('vane_test_logger')
# test_logger.addHandler(logging.NullHandler())


class TempfileTestFixture(unittest.TestCase):
    """Mixin :class:`~python:unittest.TestCase` class for \
        :py:mod:`sknano.io` unit tests.
    Defines setUp/tearDown methods to keep track of and delete temporary files
    created by unit tests.
    """

    def setUp(self):
        """Initialize list for names of temporary files."""
        self.tmpdata = []
        super(TempfileTestFixture, self).setUp()

    def tearDown(self):
        """Remove files in :attr:`~TempfileTestFixture.tmpdata`."""
        for f in self.tmpdata:
            try:
                os.remove(f)
            except OSError:
                continue

        super(TempfileTestFixture, self).tearDown()


class NetworkTestFixture(unittest.TestCase):

    @property
    def modeler_conus_json_network(self):
        datafile = os.path.join(datadir, 'Modeler_CONUS_Test_Network.json')
        return load_json(datafile)

    @property
    def modeler_geographic_json_network(self):
        datafile = os.path.join(datadir, 'Modeler_Geographic_Example_Network.json')
        return load_json(datafile)

    @property
    def modeler_large_json_network(self):
        datafile = os.path.join(datadir, 'Modeler_Large_Example_Network.json')
        return load_json(datafile)

    @property
    def modeler_medium_json_network(self):
        datafile = os.path.join(datadir, 'Modeler_Medium_Example_Network.json')
        return load_json(datafile)

    @property
    def modeler_tiny_json_network(self):
        datafile = os.path.join(datadir, 'Modeler_Tiny_Example_Network.json')
        return load_json(datafile)

    @property
    def opnet_conus_json_network(self):
        datafile = os.path.join(datadir, 'OPNET_XML_CONUS_Test_Network.json')
        return load_json(datafile)

    @property
    def opnet_geographic_json_network(self):
        datafile = os.path.join(datadir, 'OPNET_XML_Geographic_Example_Network.json')
        return load_json(datafile)

    @property
    def opnet_large_json_network(self):
        datafile = os.path.join(datadir, 'OPNET_XML_Large_Example_Network.json')
        return load_json(datafile)

    @property
    def opnet_medium_json_network(self):
        datafile = os.path.join(datadir, 'OPNET_XML_Medium_Example_Network.json')
        return load_json(datafile)

    @property
    def opnet_tiny_json_network(self):
        datafile = os.path.join(datadir, 'OPNET_XML_Tiny_Example_Network.json')
        return load_json(datafile)

    @property
    def test_network(self):
        return generate_network(self.opnet_medium_json_network)


class NetworkStructuresTestFixture(NetworkTestFixture, TempfileTestFixture):

    @property
    def profile(self):
        return [{'time': 0, 'amount': 1e9},
                {'time': 3600, 'amount': 1e9},
                {'time': 7200, 'amount': 1e9},
                {'time': 10800, 'amount': 1e9},
                {'time': 14400, 'amount': 1e9},
                {'time': 18000, 'amount': 1e9},
                {'time': 21600, 'amount': 1e9},
                {'time': 25200, 'amount': 1e9},
                {'time': 28800, 'amount': 1e9},
                {'time': 32400, 'amount': 1e9},
                {'time': 36000, 'amount': 1e9},
                {'time': 39600, 'amount': 1e9},
                {'time': 43200, 'amount': 1e9},
                {'time': 46800, 'amount': 1e9},
                {'time': 50400, 'amount': 1e9},
                {'time': 54000, 'amount': 1e9},
                {'time': 57600, 'amount': 1e9},
                {'time': 61200, 'amount': 1e9},
                {'time': 64800, 'amount': 1e9},
                {'time': 68400, 'amount': 1e9},
                {'time': 72000, 'amount': 1e9},
                {'time': 75600, 'amount': 1e9},
                {'time': 79200, 'amount': 1e9},
                {'time': 82800, 'amount': 1e9}]

    @property
    def demand(self):
        return Demand(id=0, name=None, from_node=None,
                      to_node=None, direction=None, profile=self.profile)

    @property
    def link(self):
        return Link(id=0, name=None, model=None, from_node=None,
                    to_node=None, direction=None,
                    capacity=1e9)

    @property
    def node(self):
        return Node(id=0, name=None, lat=0.0, lng=0.0, loc_code=None,
                    tz=None, parent=None, equipment=None)

    @property
    def subnet(self):
        return Subnet(id=0, name=None, description=None, lat=0.0, lng=0.0,
                      loc_code=None, tz=None, parent=None)

    @property
    def demands(self):
        return self.test_network.demands

    @property
    def links(self):
        return self.test_network.links

    @property
    def nodes(self):
        return self.test_network.nodes

    @property
    def subnets(self):
        return self.test_network.subnets


class NetworkStudyTestFixture(unittest.TestCase):

    @property
    def demand_failure_study_data(self):
        keys = {0: 'constant', 1: 'percent'}
        i = np.random.randint(2)
        return self.get_demand_failure_study_data(key=keys[i])

    def get_demand_failure_study_data(self, key='constant'):
        if key == 'constant':
            datafile = 'demand_failure_study-constant_increase.json'
            # datafile = 'demand_failure_study-scenario2_network.json'
        else:
            datafile = 'demand_failure_study-percent_increase.json'

        return load_json(os.path.join(datadir, datafile))
