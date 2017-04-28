"""Class representation of a demand."""
from __future__ import absolute_import, division, print_function

from collections import deque, Counter
from operator import attrgetter

import logging

import networkx as nx
import numpy as np
from scipy import stats
import matplotlib.pyplot as plt
import pandas as pd

from ..utils import validate_route_nodes, validate_route_links, \
    validate_route_bandwidth, pairwise, take, pluralize
from . import NetworkObject, GraphMixin, EdgeObject, TrafficMixin, \
    NetworkObjectCollection, Nodes, Links, Route, Routes

logger = logging.getLogger('root')


__all__ = ['Demand', 'Demands']


class Demand(TrafficMixin, GraphMixin, EdgeObject, NetworkObject):
    """Class representation of network demand."""

    status_code_map = {'S': 'satisfied',
                       'P': 'partially satisfied',
                       'U': 'unsatisfied'}

    def __init__(self, traffic=None, **kwargs):

        self._traffic_profile = kwargs.pop('profile', traffic)

        super(Demand, self).__init__(**kwargs)

        self.reprstr = ', '.join((self.reprstr, 'traffic={traffic!r}'))
        self.status_code = None

        self.routes = Routes()
        self.routes.demand = self
        self.initialize_traffic()

    def __dir__(self):
        attrs = super(Demand, self).__dir__()
        attrs.extend(['traffic'])
        return attrs

    @property
    def status(self):
        return self.status_code_map.get(self.status_code, None)

    def initialize_traffic(self):
        """Initialize the traffic array."""
        traffic = []

        try:
            times = []
            amounts = []
            for profile in self._traffic_profile:
                times.append(profile['time'])
                amounts.append(profile['amount'])
            traffic = list(sorted(list(zip(times, amounts)),
                                  key=lambda x: (x[0], x[1])))

            # for profile in value:
            #     time, amount = profile
            #     traffic[traffic[:, 0] == time] = np.array([[time, amount]])

        except (KeyError, IndexError, TypeError):
            pass
        finally:
            self.traffic = traffic
            self.traffic0 = self.traffic.copy()

    def get_paths(self, graph, **kwargs):
        from_node = kwargs.get('from_node', self.from_node)
        to_node = kwargs.get('to_node', self.to_node)
        args = (graph, from_node, to_node)
        return super(Demand, self).get_paths(*args, **kwargs)

    def generate_routes(self, nodes=None, links=None, graph=None,
                        initialize_link_traffic=False, **kwargs):

        if graph is None:
            graph = self.generate_graph(nodes, links)

        if initialize_link_traffic:
            [link.initialize_traffic(self.time_array) for link in links]

        try:
            paths = list(self.get_paths(graph, **kwargs))
            alt_paths = list(self.get_paths(graph, algorithm='all_simple_paths'))

            if self.verbose:
                print("Generating routes for Demand {}: {} --> {}".format(
                    self.id, self.from_node, self.to_node))

            # Generate a list of valid routes by filtering out invalid links
            # (links not found in the network) and links with infinite cost
            # (i.e., zero capacity)
            routes = \
                filter(validate_route_links(links),
                       filter(validate_route_nodes(links.nodes), paths))

            alt_routes = \
                filter(validate_route_links(links),
                       filter(validate_route_nodes(links.nodes), alt_paths))

            if self.verbose:
                print("Found {} {}, {}/{} are valid.".format(
                    len(paths), pluralize("path", len(paths)),
                    len(routes), len(paths)))

            # print('{} generated paths:'.format(len(paths)))
            # [print(list(path)) for path in paths]

            # Filter shortest paths from alt paths

            # print('{} simple paths:'.format(len(alt_paths)))
            # [print(list(path)) for path in alt_paths]

            # print('{} valid routes:'.format(len(routes)))
            # [print(list(route)) for route in routes]

            # Generate a list of `Nodes` objects for each route in routes
            # Each `Node` object in each `Nodes` object is a reference to a
            # `Node` object found in the `Nodes` object assigned to the
            # `nodes` attribute.
            route_nodes = \
                [Nodes([nodes.get(node) for node in route])
                 for route in routes]

            # Generate a list of `Links` objects for each route in routes
            # Each `Link` object in each `Links` object is a reference to a `Link`
            # object found in the `Links` object assigned to the `links`
            # attribute.
            route_links = \
                [Links([links.get(link) for link in pairwise(route)])
                 for route in routes]

            # Generate a list of `Route` objects for each pair of
            # (`Nodes`, `Links`) in the `route_nodes` and `route_links` lists
            routes = \
                Routes([Route(demand=self, nodes=nodes, links=links)
                        for (nodes, links) in zip(route_nodes, route_links)])

            # [print(route) for route in routes]

            if routes:
                self._route_traffic(routes)
        except nx.NetworkXNoPath as e:
            print(e)

    def _route_traffic(self, routes):
        # Sort the routes by route cost.
        routes.sort()
        costs = np.asarray(np.around(routes.costs, decimals=5)).tolist()
        # costs = routes.costs
        # print('routes.costs: {}'.format(costs))
        costs_counter = Counter(costs)
        count_deque = deque(sorted(costs_counter.values()))
        # print('costs_counter: {}'.format(costs_counter))
        # print('count_deque: {}'.format(count_deque))

        # Assign demand traffic
        traffic = self.traffic.copy()
        iroutes = iter(routes)
        while True:
            count = count_deque.popleft()
            # print('taking {} routes'.format(count))
            routes = \
                self._validate_route_bandwidth(take(count, iroutes), traffic)

            if routes:
                balanced_traffic = traffic.copy()
                load_balance = len(routes)
                balanced_traffic[:, 1] = balanced_traffic[:, 1] / load_balance

                for route in routes:
                    route.add_traffic(balanced_traffic)
                    traffic[:, 1] -= balanced_traffic[:, 1]

                try:
                    assert np.allclose(np.zeros(traffic.shape[0]), traffic[:, 1], atol=1e-3)
                except AssertionError as e:
                    print(e)
                    print('traffic:\n{}'.format(traffic))

                self.routes.extend(routes)

            if np.allclose(traffic[:, 1], np.zeros(traffic.shape[0])) or \
                    len(count_deque) == 0:
                break

        if self.routes:
            self.routes.sort()
            self.status_code = 'S'

            if self.verbose:
                print("Demand satisfied with {} {}.".format(
                    len(self.routes), pluralize("route", len(self.routes))))
        else:
            self.status_code = 'U'
            if self.verbose:
                print("Demand unsatisfied...")

        # print('Demand routes:')
        # [print(list(route.nodes.ids)) for route in self.routes]
        # print()

    def _validate_route_bandwidth(self, routes, traffic):
        while True:
            prev_count = len(routes)
            routes = \
                filter(
                    validate_route_bandwidth(routes, traffic), routes)
            if len(routes) == prev_count:
                break

        return routes

    def plot_route_traffic(self):
        nroutes = len(self.routes)
        columns = ['time'] + \
            [''.join(route) for route in zip(nroutes * ['route'],
                                             map(str, range(1, nroutes + 1)))]
        route_traffic = pd.DataFrame(self.routes.traffic, columns=columns)
        route_traffic.plot.bar(x='time')
        plt.show()

    def reset_routes(self):
        self.routes.clear()

    def reset_status(self):
        self.status_code = None

    def get_results(self, data=None):
        if data is None:
            data = {'routes': [], 'links': []}

        try:
            routes = data.get('routes', None)
            links = data.get('links', None)
            self._update_results(routes, links)
            return data
        except AttributeError:
            raise ValueError('Expected dict for data parameter')

    def _update_results(self, routes=None, links=None):

        if routes is not None:
            [routes.append(route.to_dict()) for route in self.routes]

        if links is not None:
            [links.append(link.to_dict()) for link in set(self.routes.links)]

    def _reprdict(self):
        d = super(Demand, self)._reprdict()
        d.update(dict(traffic=self.traffic_profile))
        return d


class Demands(GraphMixin, NetworkObjectCollection):
    """Custom container class for collection of `Demand` objects."""
    @property
    def results(self):
        return self.get_results()

    @property
    def traffic(self):
        return [demand.traffic for demand in self]

    @property
    def satisfied(self):
        return [demand for demand in self if demand.status_code == 'S']

    @property
    def unsatisfied(self):
        return [demand for demand in self if demand.status_code == 'U']

    @property
    def partially_satisfied(self):
        return [demand for demand in self if demand.status_code == 'P']

    @property
    def status_counter(self):
        return Counter([demand.status for demand in self])

    @classmethod
    def from_dict(cls, d):
        """Return `Demands` instance from `dict`."""
        demands = []
        try:
            for demand in d['demands']:
                demands.append(Demand.from_dict(demand))
        except KeyError as e:
            print(e)
        finally:
            obj = cls(demands)
            obj.sort(key=attrgetter('id'))
            return obj

    def generate_routes(self, nodes=None, links=None, graph=None,
                        algorithm=None, **kwargs):
        if graph is None:
            graph = self.generate_graph(nodes, links)

        tmax = 0
        for demand in self:
            tmax = max(tmax, max(demand.time_array))

        # print('max time: {}'.format(tmax))

        bin_width = kwargs.pop('bin_width', 3600)
        time_array = np.arange(0, tmax + bin_width, bin_width)
        bins = np.arange(-bin_width / 2, tmax + 3 * bin_width / 2, bin_width)
        [link.initialize_traffic(time_array) for link in links]
        [demand.bin_traffic(time_array, bins) for demand in self]
        [demand.generate_routes(nodes, links, graph, algorithm=algorithm)
         for demand in self]

        # for demand in self:
        #     demand.generate_routes(nodes, links, graph, algorithm=algorithm)
        #     if demand.satisfied:
        #         routes = demand.routes
        #         print('Demand satisifed with {} routes'.format(len(routes)))
        #         print('Demand traffic:\n{}'.format(demand.traffic))
        #         for i, route in enumerate(routes, start=1):
        #             print('Route {}'.format(i))
        #             print('Traffic:\n{}'.format(route.traffic))
        #     else:
        #         print('Demand not satisfied')

    def reset_routes(self):
        [demand.reset_routes() for demand in self]

    def reset_statuses(self):
        [demand.reset_status() for demand in self]

    def get_results(self, data=None):
        try:
            self._update_results(data)
            return data
        except ValueError:
            return self.get_results({'routes': [], 'links': []})

    def _update_results(self, data):
        try:
            route_data = data['routes']
            link_data = data['links']
        except (KeyError, TypeError):
            raise ValueError('Expected `dict` with `routes` and `links` keys')

        links_set = set()
        [(demand._update_results(routes=route_data),
            links_set.update(set(demand.routes.links))) for demand in self]

        [link_data.append(link.to_dict()) for link in links_set]
