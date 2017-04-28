"""Node classes."""

from __future__ import absolute_import, division, print_function

import numpy as np

from . import NetworkObject, LocationObject, NetworkObjectCollection

__all__ = ['Node', 'Nodes']


class Node(LocationObject, NetworkObject):

    equipment_map = {}

    def __init__(self, equipment=None, **kwargs):

        self.equipment = None
        super(Node, self).__init__(**kwargs)
        self.reprstr = ', '.join((self.reprstr, 'equipment={equipment!r}'))

        self.incoming_links = []
        self.outgoing_links = []

    def __dir__(self):
        attrs = super(Node, self).__dir__()
        attrs.append('equipment')
        return attrs


class Nodes(NetworkObjectCollection):
    """Custom container class for `Node` objects."""

    @classmethod
    def from_dict(cls, d):
        nodes = []
        try:
            for node in d['nodes']:
                nodes.append(Node.from_dict(node))
        except KeyError as e:
            print(e)
        finally:
            return cls(nodes)

    @property
    def coords(self):
        return np.asarray([node.coords for node in self])

    @property
    def positions(self):
        return {node.id: node.coords for node in self}
