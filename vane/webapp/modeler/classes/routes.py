"""Route classes."""

from __future__ import absolute_import, division, print_function

from copy import deepcopy
from operator import attrgetter
import numpy as np

from ..utils import flatten
from . import NetworkObject, TrafficMixin, NetworkObjectCollection

__all__ = ['Route', 'Routes']


class Route(TrafficMixin, NetworkObject):
    """Class representation of a demand route."""

    def __init__(self, demand=None, nodes=None, links=None, **kwargs):

        self.demand = demand
        self.nodes = nodes
        self.links = links
        # self._links = deepcopy(links)
        # self._links.reset_traffic()

        kwargs['id'] = self.demand.id

        super(Route, self).__init__(**kwargs)

        self.reprstr = ', '.join(('id={id!r}', 'demand={demand!r}',
                                  'nodes={nodes!r}', 'links={links!r}'))

    def __dir__(self):
        attrs = super(Route, self).__dir__()
        attrs.extend(['demand', 'nodes', 'links'])
        return attrs

    def __str__(self):
        strrep = '\n'.join((self.__class__.__name__, 80 * '-'))
        strrep += '\n'
        strrep += 'Cost: {}\n'.format(self.cost)
        strrep += 'Capacity: {}\n'.format(self.capacity)
        for link in self.links:
            strrep += '  Link {}\n'.format(link.id)
            strrep += '    cost: {}\n'.format(link.cost)
            strrep += '    capacity: {}\n'.format(link.capacity)
        return strrep

    @property
    def cost(self):
        """Return cost of route."""
        try:
            return self._cost
        except AttributeError:
            self._update_cost()
            return self._cost

    @property
    def capacity(self):
        """Route capacity."""
        try:
            return self._capacity
        except AttributeError:
            self._update_capacity()
            return self._capacity

    def add_traffic(self, traffic):
        links = self.links
        for link in links:
            link.traffic[:, 1] += traffic[:, 1]
            assert link.max_traffic <= link.capacity
            link.demand_ids.add(self.id)

        self.traffic = traffic.copy()

    def _update_cost(self):
        self._cost = np.sum(self.links.costs)

    def _update_capacity(self):
        try:
            self._capacity = np.min(self.links.capacities)
        except TypeError as e:
            print(e)
            return 0.0

    def to_dict(self):
        return dict(id=self.id, link_ids=[link.id for link in self.links],
                    traffic=self.traffic_profile)


class Routes(NetworkObjectCollection):
    """Custom container class for `Route` objects."""

    @property
    def costs(self):
        return [route.cost for route in self]

    @property
    def nodes(self):
        return list(flatten([route.nodes for route in self]))

    @property
    def links(self):
        return list(flatten([route.links for route in self]))

    @property
    def traffic(self):
        try:
            traffic = []
            for i, route in enumerate(self):
                if i == 0:
                    traffic.append(route.traffic[:, 0].tolist())
                traffic.append(route.traffic[:, 1].tolist())
            return np.asarray(traffic).T
        except AttributeError as e:
            print(e)
            return None

    def sort(self, key=attrgetter('cost'), reverse=False):
        super(Routes, self).sort(key=key, reverse=reverse)

    def get_results(self, data=None):
        if data is None:
            data = []
        self._update_results(data)
        return data

    def _update_results(self, data):
        if not isinstance(data, list):
            raise ValueError('Expected a list of data')

        [data.append(route.to_dict()) for route in self]
