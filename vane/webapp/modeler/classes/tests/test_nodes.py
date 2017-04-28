from __future__ import absolute_import, division, print_function

from nose.tools import assert_true, assert_false, assert_equal, assert_not_equal, \
    assert_is_instance
import nose

from modeler.classes import Node, Nodes

from modeler.testing import NetworkStructuresTestFixture


class Tests(NetworkStructuresTestFixture):

    def test1(self):
        node = self.node
        assert_is_instance(node, Node)

        # json_node = node.to_json()
        # tmpfile = 'node.json'
        # self.tmpdata.append(tmpfile)

        # with open(tmpfile, 'wt') as f:
        #     f.write(json_node)

        # node_from_json = Node.from_json(json_node)
        # assert_is_instance(node_from_json, Node)
        # assert_false(node is node_from_json)
        # assert_equal(node, node_from_json)

    def test2(self):
        nodes = self.nodes
        assert_is_instance(nodes, Nodes)
        # json_nodes = nodes.to_json()
        # tmpfile = 'nodes.json'
        # self.tmpdata.append(tmpfile)
        # with open(tmpfile, 'wt') as f:
        #     f.write(json_nodes)

        # nodes_from_json = Nodes.from_json(json_nodes)
        # assert_is_instance(nodes_from_json, Nodes)
        # assert_equal(nodes, nodes_from_json)


if __name__ == '__main__':
    nose.runmodule()
