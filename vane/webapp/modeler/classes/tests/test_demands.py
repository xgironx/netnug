from __future__ import absolute_import, division, print_function

from nose.tools import assert_true, assert_false, assert_equal, assert_not_equal, \
    assert_is_instance
import nose

from modeler.classes import Demand, Demands

from modeler.testing import NetworkStructuresTestFixture


class Tests(NetworkStructuresTestFixture):

    def test1(self):
        demand = self.demand
        assert_is_instance(repr(demand), str)
        assert_is_instance(str(demand), str)
        assert_is_instance(demand, Demand)
        # json_demand = demand.to_json()
        # tmpfile = 'demand.json'
        # self.tmpdata.append(tmpfile)
        # with open(tmpfile, 'wt') as f:
        #     f.write(json_demand)

        # demand_from_json = Demand.from_json(json_demand)
        # assert_is_instance(demand_from_json, Demand)
        # assert_equal(demand, demand_from_json)

    def test2(self):
        demands = self.demands
        assert_is_instance(demands, Demands)
        # json_demands = demands.to_json()
        # tmpfile = 'demands.json'
        # self.tmpdata.append(tmpfile)
        # with open(tmpfile, 'wt') as f:
        #     f.write(json_demands)

        # demands_from_json = Demands.from_json(json_demands)
        # assert_is_instance(demands_from_json, Demands)
        # assert_equal(demands, demands_from_json)


if __name__ == '__main__':
    nose.runmodule()
