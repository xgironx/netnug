"""Class representations of basic network data structures."""
from __future__ import absolute_import, division, print_function

# from abc import ABCMeta, abstractmethod
# from copy import copy, deepcopy

import json
# import os
import logging

import networkx as nx
import numpy as np
from scipy import stats
import matplotlib.pyplot as plt
import pandas as pd

from ..utils import flatten

logger = logging.getLogger('root')


__all__ = ['GraphMixin', 'IOMixin', 'TrafficMixin']


class IOMixin(object):
    """I/O mixin."""

    def to_json(self):
        # return jsonpickle.encode(self)
        return None

    @classmethod
    def from_json(cls, obj):
        # return jsonpickle.decode(obj)
        pass

    def to_dict(self):
        """Return dict representation of object.

        Returns
        =======
        JSON serializable dict representation
        """
        return vars(self)

    @classmethod
    def from_dict(cls, d):
        """Return object representation from dict representation created using
        to_dict method."""
        return cls(**d)


class GraphMixin(object):

    def generate_graph(self, nodes, links, weighted_edges=True):
        g = nx.Graph()
        g.add_nodes_from(nodes.ids)

        if weighted_edges:
            edges = \
                list(map(tuple, map(flatten, zip(links.nodes, links.costs))))
            g.add_weighted_edges_from(edges)
        else:
            g.add_edges_from(links.nodes)
        return g

    def get_paths(self, graph, source, target, algorithm=None, **kwargs):
        args = (graph, source, target)
        if algorithm == 'shortest_path':
            paths = \
                nx.shortest_path(*args, weight=kwargs.get('weight', 'weight'))
        elif algorithm == 'all_shortest_paths':
            paths = \
                nx.all_shortest_paths(*args, weight=kwargs.get('weight', 'weight'))
        elif algorithm == 'dijkstra_path':
            paths = [nx.dijkstra_path(*args,
                                      weight=kwargs.get('weight', 'weight'))]
        elif algorithm == 'shortest_simple_paths':
            paths = \
                nx.shortest_simple_paths(*args, weight=kwargs.get('weight', 'weight'))
        elif algorithm == 'all_simple_paths':
            paths = \
                nx.all_simple_paths(*args, cutoff=kwargs.get('cutoff', None))
        else:
            raise ValueError('Unknown or unimplemented networkx algorithm: {}'.format(algorithm))

        return paths

    def draw(self, graph, **kwargs):
        """Call :func:`networkx:networkx.draw`."""
        nx.draw(graph, **kwargs)
        plt.show()

    def draw_networkx(self, graph, **kwargs):
        """Call :func:`networkx:networkx.draw_networkx`."""
        nx.draw_networkx(graph, **kwargs)
        plt.show()


class TrafficMixin(object):
    """
    Mixin class for implementing traffic calculations to network data
    structures.

    """
    @property
    def traffic(self):
        return np.asarray(self._traffic)

    @traffic.setter
    def traffic(self, value):
        self._traffic = np.asarray(value, dtype=float)
        # print(self._traffic)
        self._time_array = self._traffic[:, 0]
        self._traffic_bps = self._traffic[:, 1]

    @property
    def time_array(self):
        try:
            return np.asarray(self._time_array)
        except AttributeError:
            return self.traffic[:, 0]

    @time_array.setter
    def time_array(self, value):
        self._time_array = np.asarray(value, dtype=float)

    @property
    def traffic_bps(self):
        try:
            return np.asarray(self._traffic_bps)
        except AttributeError:
            return self.traffic[:, 1]

    @traffic_bps.setter
    def traffic_bps(self, value):
        self._traffic_bps = np.asarray(value, dtype=float)

    @property
    def average_traffic(self):
        return np.mean(self.traffic[:, 1])

    @property
    def max_traffic(self):
        return np.max(self.traffic[:, 1])

    @property
    def total_traffic(self):
        return np.sum(self.traffic[:, 1])

    @property
    def traffic_profile(self):
        traffic = self.traffic
        return [dict(time=time, amount=amount) for (time, amount)
                in traffic if amount > 0]

    @property
    def traffic_summary(self):
        return self.total_traffic, self.max_traffic, self.average_traffic

    def bin_traffic(self, time_array=None, bins=None, bin_width=None):
        self.traffic = self.get_binned_traffic(self.traffic, time_array, bins, bin_width)

    def get_binned_traffic(self, traffic, time_array=None, bins=None, bin_width=None):
        if time_array is None:
            time_array = traffic[:, 0]
        if bins is None:
            tmin = min(time_array)
            tmax = max(time_array)
            if bin_width is None:
                bin_width = 3600
            time_array = np.arange(tmin, tmax + bin_width, bin_width)
            bins = np.arange(tmin - bin_width / 2, tmax + bin_width + bin_width / 2, bin_width)
        # print("traffic:\n{}".format(traffic))
        # print('bins:\n{}'.format(bins))
        bps, bin_edges, bin_number = \
            stats.binned_statistic(traffic[:, 0], traffic[:, 1], 'sum', bins=bins)
        # print('bin_edges:\n{}'.format(bin_edges))
        traffic = np.asarray(zip(time_array.tolist(), bps.tolist()), dtype=float)
        # print("binned traffic: {}".format(traffic))
        return traffic

    def get_max_traffic(self, with_index=False):
        tmax = self.max_traffic
        if with_index:
            return tmax, np.where(self.traffic[:, 1] == tmax)
        return tmax

    # def get_timeseries_array(self, ts_min=0, ts_max=24 * 3600, dt=3600):
    #     return np.arange(ts_min, ts_max, dt)

    # def new_traffic_array(self, ts_min=0, ts_max=24 * 3600, dt=3600,
    #                       shape=(24, 1)):
    #     ts_index = np.arange(ts_min, ts_max, dt)
    #     traffic_array = np.zeros(shape)
    #     try:
    #         return np.hstack((ts_index.reshape((shape[0], 1)), traffic_array))
    #     except ValueError as e:
    #         print(e)
    #         return None

    @property
    def traffic_dataframe(self):
        return pd.DataFrame(self.traffic, columns=['time', 'amount'])

    def plot_traffic(self):
        df = self.traffic_dataframe
        df.plot.bar(x='time', y='amount')
        plt.show()
