from __future__ import absolute_import, division, print_function

from nose.tools import assert_true, assert_false, assert_equal, assert_not_equal, \
    assert_is_instance
import nose

from modeler.classes import Route, Routes

from modeler.testing import NetworkStructuresTestFixture


class Tests(NetworkStructuresTestFixture):

    def test1(self):
        pass


if __name__ == '__main__':
    nose.runmodule()
