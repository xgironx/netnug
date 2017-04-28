"""
==============================================================================
Subnet data structures. (:mod:`vane.webapp.modeler.subnets`)
==============================================================================

"""

from __future__ import absolute_import, division, print_function

from . import NetworkObject, GraphMixin, LocationObject, \
    NetworkObjectCollection, Nodes, Links, Demands

__all__ = ['Subnet', 'Subnets']


class Subnet(GraphMixin, LocationObject, NetworkObject):
    """Subnet class."""

    def __init__(self, nodes=None, links=None, demands=None, subnets=None,
                 **kwargs):
        super(Subnet, self).__init__(**kwargs)
        self._nodes = Nodes(nodes)
        self._links = Links(links)
        self._demands = Demands(demands)
        self._subnets = Subnets(subnets)

    @property
    def nodes(self):
        """Return all nodes recursively."""
        nodes = Nodes(self._nodes[:])
        for subnet in self._subnets:
            nodes.extend(subnet.nodes)
        return nodes

    @property
    def links(self):
        """Return all links recursively."""
        links = Links(self._links[:])
        for subnet in self._subnets:
            links.extend(subnet.links)
        return links

    @property
    def demands(self):
        demands = Demands(self._demands[:])
        for subnet in self._subnets:
            demands.extend(subnet.demands)
        return demands

    @property
    def subnets(self):
        return self._subnets

    @classmethod
    def from_dict(cls, d):
        """Return `Subnet` instance from dictionary."""
        nodes = Nodes.from_dict(d)
        links = Links.from_dict(d)
        demands = Demands.from_dict(d)
        subnets = Subnets.from_dict(d)
        if 'id' in d:
            [setattr(obj, 'parent', d['id']) for obj in
             (nodes, links, demands, subnets)]
        d['nodes'] = nodes
        d['links'] = links
        d['demands'] = demands
        d['subnets'] = subnets
        return cls(**d)

    def satisfy_demands(self, return_results=False, **kwargs):
        nodes, links = self.nodes, self.links
        graph = self.generate_graph(nodes, links, weighted_edges=True)

        demands = self.demands
        print("Generating routes for {} demands...".format(len(demands)))
        demands.generate_routes(nodes, links, graph, **kwargs)

        return demands.results if return_results else None


class Subnets(NetworkObjectCollection):
    """Custom container class for `Subnet` objects."""

    @classmethod
    def from_dict(cls, d):
        subnets = []
        try:
            for subnet in d['subnets']:
                subnets.append(Subnet.from_dict(subnet))
        except (AttributeError, KeyError):
            pass
        finally:
            return cls(subnets)
