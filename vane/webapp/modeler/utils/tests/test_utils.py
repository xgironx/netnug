from __future__ import absolute_import, division, print_function

import json
import logging
import nose
from nose.tools import assert_equal, assert_true

import networkx as nx

from modeler.testing import NetworkTestFixture, TempfileTestFixture
from modeler.classes import Nodes, Links, Demands, Subnet
from modeler.utils import parse_json_network, take

# logging.basicConfig(filename='test.log',
#                     filemode='w', level=logging.INFO)


class Tests(NetworkTestFixture, TempfileTestFixture):

    def test1(self):
        nodes, links, demands = parse_json_network(
            self.modeler_geographic_json_network)
        opnet_network = Subnet.from_dict(self.opnet_geographic_json_network)

        assert_equal(len(nodes), len(opnet_network.nodes))
        assert_equal(len(links), len(opnet_network.links))
        assert_equal(len(demands), len(opnet_network.demands))

        # assert_equal(nodes.ids, opnet_network.nodes.ids)
        assert_equal(demands.ids.tolist(), opnet_network.demands.ids.tolist())

        demands.generate_routes(nodes=nodes, links=links,
                                algorithm='all_simple_paths')

        # [print(demand.routes.costs) for demand in demands]
        results = opnet_network.satisfy_demands(return_results=True,
                                                algorithm='all_simple_paths')

        assert_equal(len(demands.results['routes']), len(results['routes']))
        assert_equal(len(demands.results['links']), len(results['links']))

    #     # g = network.as_graph()
    #     # print('g.nodes(): {}'.format(g.nodes()))
    #     # print('g.edges(): {}'.format(g.edges()))
    #     # print('Graph: {}'.format(g))
    #     # network.draw(g)
    #     # print(network.all_all_simple_paths(demands[0].id))

    def test2(self):
        data = self.modeler_geographic_json_network
        nodes, links, demands = parse_json_network(data)
        demands.generate_routes(nodes, links, algorithm='all_simple_paths')
        # demand = demands[1]
        # demand_traffic = demand.traffic
        # demand_traffic_df = demand.traffic_dataframe
        # [print(route.capacity) for route in demand.routes]
        # [print(route.traffic_dataframe) for route in demand.routes]
        for demand in demands:
            for route in demand.routes:
                if route.max_traffic > route.capacity:
                    print(route.links.ids)

    def test3(self):
        network = self.test_network
        network.satisfy_demands(algorithm='all_simple_paths')

        results = network.demands.results

        # routes = results['routes']
        # print('len(routes): {}'.format(len(routes)))

        demand_ids = set()
        link_ids = set()
        # node_ids = set()
        for link in results['links']:
            demand_ids.update(link['demand_ids'])
            link_ids.add(link['id'])

        assert_equal(len(network.demands), len(demand_ids))

        unused_links = set(network.links.ids) - link_ids
        assert_equal(len(set(network.links.ids)),
                     len(results['links']) + len(unused_links))

    def test4(self):
        network = self.test_network
        network.satisfy_demands(algorithm='all_simple_paths')

        results = network.demands.results

        tmpfile = 'results.json'
        self.tmpdata.append(tmpfile)
        with open(tmpfile, 'wt') as f:
            f.write(json.dumps(results))

    def test5(self):
        nodes, links, demands = parse_json_network(
            self.modeler_medium_json_network)
        demands.generate_routes(nodes, links, algorithm='all_simple_paths')
        graph = demands.generate_graph(nodes, links)
        # layout = nx.spring_layout(graph)
        # print(layout)
        # positions = nodes.positions
        # print(positions)
        # demands.draw(graph, pos=positions)
        # [print((demand.traffic, demand.routes.traffic)) for demand in demands]
        # demands[0].plot_route_traffic()

    def test6(self):

        network = self.test_network
        network.satisfy_demands(algorithm='all_simple_paths')

        nodes = network.nodes
        links = network.links
        demands = network.demands

        #results = network.demands.results

        # nodes, links, demands = parse_json_network(self.tiny_network)
        # demands.generate_routes(nodes, links, algorithm='all_simple_paths')
        graph = demands.generate_graph(nodes, links)
        # # layout = nx.spring_layout(graph)
        # # print(layout)
        # demands.draw(graph, pos=nodes.positions)
        # for demand in demands:
        #     print('demand.traffic:\n{}'.format(demand.traffic))
        #     for route in demand.routes:
        #         print('route.traffic:\n{}'.format(route.traffic))
        # [print((demand.traffic, demand.routes.traffic)) for demand in demands]
        # # demands[0].plot_route_traffic()


if __name__ == '__main__':
    # print('test_utils...')
    nose.runmodule()
