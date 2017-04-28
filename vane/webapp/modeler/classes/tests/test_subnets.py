from __future__ import absolute_import, division, print_function

from nose.tools import assert_true, assert_false, assert_equal, \
    assert_not_equal, assert_is_instance
import nose

from modeler.classes import Subnet, Subnets
from modeler.testing import NetworkStructuresTestFixture


class Tests(NetworkStructuresTestFixture):

    def test1(self):
        subnet = self.subnet
        assert_is_instance(subnet, Subnet)

        # json_subnet = subnet.to_json()
        # tmpfile = 'subnet.json'
        # self.tmpdata.append(tmpfile)
        # with open(tmpfile, 'wt') as f:
        #     f.write(json_subnet)

        # subnet_from_json = Subnet.from_json(json_subnet)
        # assert_is_instance(subnet_from_json, Subnet)

    def test2(self):
        subnets = self.subnets
        assert_is_instance(subnets, Subnets)
        # json_subnets = subnets.to_json()
        # tmpfile = 'subnets.json'
        # self.tmpdata.append(tmpfile)
        # with open(tmpfile, 'wt') as f:
        #     f.write(json_subnets)

        # subnets_from_json = Subnets.from_json(json_subnets)
        # assert_is_instance(subnets_from_json, Subnets)
        # assert_equal(subnets, subnets_from_json)


if __name__ == '__main__':
    nose.runmodule()
