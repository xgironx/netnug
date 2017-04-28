"""Link classes."""
from __future__ import absolute_import, division, print_function

import numpy as np

from . import NetworkObject, EdgeObject, TrafficMixin, \
    NetworkObjectCollection

__all__ = ['Link', 'Links']


class Link(TrafficMixin, EdgeObject, NetworkObject):
    """Class representation of a network link."""
    capacity_map = {'10Gbps': 10e9,
                    '40Gbps': 40e9,
                    '10BaseT': 10e6,
                    '100BaseT': 100e6,
                    '1000BaseX': 1e9,
                    'T1_int': 192e3,
                    'PPP_SONET_OC192': 9953.28e6,
                    'PPP_SONET_OC48': 2488.32e6,
                    'PPP_SONET_OC3': 155.52e6,
                    'PPP_DS0': 64e3,
                    'PPP_DS3': 44.736e6,
                    'DS3': 44.736e6,
                    'PPP_SONET_OC12': 622.08e6,
                    'PPP_SONET_OC1': 51.84e6,
                    '100Mps': 1e6,
                    }

    def __init__(self, capacity=None, duplex=False, direction=None,
                 reverseLink=None, **kwargs):

        super(Link, self).__init__(**kwargs)

        if capacity is None:
            capacity = \
                Link.capacity_map.get(self.model, Link.capacity_map.get(self.model.split('_')[0], 0.0))
        self.capacity = capacity

        self.duplex = duplex
        self.direction = direction
        self.reverseLink = reverseLink
        self.reprstr = ', '.join((self.reprstr, 'capacity={capacity!r}',
                                  'duplex={duplex!r}',
                                  'direction={direction!r}',
                                  'reverseLink={reverseLink!r}'))
        self.demand_ids = set()

    def __dir__(self):
        attrs = super(Link, self).__dir__()
        attrs.extend(['usage', 'capacity', 'traffic', 'duplex',
                      'direction', 'reverseLink'])
        return attrs

    @property
    def cost(self):
        try:
            return self._cost
        except AttributeError:
            self._update_cost()
            return self._cost

    @property
    def nodes(self):
        return (self.from_node, self.to_node)

    @property
    def usage(self):
        return self.max_traffic / self.capacity

    def compute_cost(self, protocol='ospf', **kwargs):

        try:
            if protocol == 'ospf':
                return self.compute_ospf_cost(**kwargs)
            else:
                raise ValueError('Unknown protocol: {}'.format(protocol))
        except ValueError as e:
            print(e)
            return np.inf

    def compute_ospf_cost(self, reference_bandwidth=1e12):
        try:
            return reference_bandwidth / self.capacity
        except ZeroDivisionError as e:
            print(e)
            print(self.model.split('_')[0])
            raise ValueError('Link has zero capacity')

    def to_dict(self):
        return dict(id=self.id, capacity=self.capacity, usage=self.usage,
                    traffic=self.traffic_profile, duplex=self.duplex,
                    direction=self.direction, reverseLink=self.reverseLink,
                    demand_ids=list(self.demand_ids))

    def initialize_traffic(self, time_array, amount=None):
        if amount is None:
            amount = np.zeros(len(time_array))
        self.traffic = np.asarray(zip(np.asarray(time_array).tolist(),
                                      np.asarray(amount).tolist()), dtype=float)

    def _update_cost(self, protocol='ospf', **kwargs):
        try:
            self._cost = self.compute_cost(protocol, **kwargs)
        except ValueError as e:
            print(e)
            self._cost = np.inf

    def _reprdict(self):
        d = super(Link, self)._reprdict()
        d.update(dict(traffic=self.traffic_profile))
        return d


class Links(NetworkObjectCollection):
    """Custom container class for `Link` objects."""

    @property
    def capacities(self):
        return [link.capacity for link in self]

    @property
    def costs(self):
        try:
            return self._costs
        except AttributeError:
            self._update_costs()
            return self._costs

    @property
    def nodes(self):
        return [link.nodes for link in self]

    @classmethod
    def from_dict(cls, d):
        links = []
        try:
            for link in d['links']:
                links.append(Link.from_dict(link))
        except KeyError as e:
            print(e)
        finally:
            return cls(links)

    def get(self, id):

        if isinstance(id, tuple):
            try:
                nodes = self.nodes
                return self[nodes.index(id)]
            except IndexError:
                print('No {} with nodes={}'.format(
                    self.__class__.__name__, id))
                return None

        return super(Links, self).get(id)

    # def bin_traffic(self, time_array=None, bins=None, bin_width=None):
    #     [link.bin_traffic(time_array, bins, bin_width) for link in self]

    def initialize_traffic(self, time_array, amount=None):
        if amount is None:
            amount = np.zeros(len(time_array), dtype=float)
        [link.initialize_traffic(time_array, amount) for link in self]

    # def reset_traffic(self, shape=(24, 1)):
    #     [link.reset_traffic(shape) for link in self]

    def _update_costs(self, protocol='ospf', **kwargs):
        [link._update_cost(protocol, **kwargs) for link in self]
        self._costs = [link.cost for link in self]
