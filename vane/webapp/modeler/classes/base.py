"""Class representations of basic network data structures."""
from __future__ import absolute_import, division, print_function

# from abc import ABCMeta, abstractmethod
# from copy import copy, deepcopy

import logging

import numpy as np

from .mixins import GraphMixin, IOMixin
from .user_list import UserList


logger = logging.getLogger('root')


__all__ = ['BaseClass', 'NetworkObject', 'NetworkObjectCollection',
           'EdgeObject', 'LocationObject']


class BaseClass(object):
    """Abstract base class defining a common set of attributes/methods."""

    # __metaclass__ = ABCMeta

    def __init__(self, **kwargs):

        self.verbose = kwargs.pop('verbose', False)
        # super(BaseClass, self).__init__(**kwargs)

        # if kwargs and self.verbose:
        #     print('extra kwargs:\n{}'.format(kwargs))

        for k, v in kwargs.iteritems():
            setattr(self, k, v)

        self.reprstr = ""

    def __repr__(self):
        return '{}({})'.format(self.__class__.__name__,
                               self.reprstr.format(**self._reprdict()))

    def _reprdict(self):
        return vars(self)


class NetworkObject(IOMixin, BaseClass):
    """Base class for network objects.

    A network object stores attributes common to network objects such as
    nodes, links, demands, routes, and subnets.

    Parameters
    -----------
    id : int
    name : str
    parent : `NetworkObject` or `int`
    description : str
    model : str

    """

    def __init__(self, id=None, name=None, description=None, model=None,
                 parent=None, **kwargs):

        super(NetworkObject, self).__init__(**kwargs)

        self.id = id
        self.name = name
        self.description = description
        self.model = model
        self.parent = parent
        self.reprstr = ', '.join(('id={id!r}', 'name={name!r}',
                                  'description={description!r}',
                                  'model={model!r}', 'parent={parent!r}'))

    def _is_valid_operand(self, other):
        return isinstance(other, self.__class__)

    def __dir__(self):
        return ['id', 'name', 'description', 'model', 'parent']

    def __eq__(self, other):
        if not self._is_valid_operand(other):
            return NotImplemented

        return self is other or \
            all([getattr(self, attr) == getattr(other, attr)
                 for attr in dir(self)])

    def __str__(self):
        strrep = '\n'.join((self.__class__.__name__, 80 * '-'))
        strrep += '\n'
        strrep += '\n'.join((' '.join((attr, ': ', str(getattr(self, attr))))
                             for attr in dir(self)))
        strrep += '\n'
        return strrep


class NetworkObjectCollection(IOMixin, UserList):
    """Custom base container class for `NetworkObject` collections."""

    @property
    def parent(self):
        try:
            return self._parent
        except AttributeError:
            return None

    @parent.setter
    def parent(self, value):
        self._parent = value
        [setattr(obj, 'parent', value) for obj in self]

    @property
    def ids(self):
        return np.asarray([obj.id for obj in self])

    @property
    def names(self):
        return [obj.name for obj in self]

    @property
    def models(self):
        return [obj.model for obj in self]

    def get(self, id):
        try:
            item = \
                (np.asarray(self.data)[
                 np.where(self.ids == id)[0]]).tolist()[0]
            return item
        except TypeError:
            print('No {} with id={}'.format(self.__class__.__name__, id))
            return None


class EdgeObject(BaseClass):
    """Edge class."""

    def __init__(self, from_node=None, to_node=None, direction=None, **kwargs):
        self.from_node = kwargs.pop('fromNode', from_node)
        self.to_node = kwargs.pop('toNode', to_node)
        self.direction = direction

        super(EdgeObject, self).__init__(**kwargs)

        self.reprstr = ', '.join((self.reprstr, 'from_node={from_node!r}',
                                  'to_node={to_node!r}',
                                  'direction={direction!r}'))

    def __dir__(self):
        attrs = super(EdgeObject, self).__dir__()
        attrs.extend(['from_node', 'to_node', 'direction'])
        return attrs


class LocationObject(BaseClass):
    """Location class."""

    _attrs = ['lat', 'lng', 'degrees']

    def __init__(self, lat=0, lng=0.0, degrees=False, state=None,
                 loc_code=None, tz=None, **kwargs):

        if 'inDegrees' in kwargs:
            degrees = kwargs.pop('inDegrees')
        self.lat = float(lat)
        self.lng = float(lng)
        self.degrees = degrees
        self.state = state
        self.loc_code = loc_code
        self.tz = tz
        super(LocationObject, self).__init__(**kwargs)

        self.reprstr = ', '.join((self.reprstr, 'lat={lat!r}', 'lng={lng!r}',
                                  'degrees={degrees!r}', 'state={state!r}',
                                  'loc_code={loc_code!r}', 'tz={tz!r}'))

    def __dir__(self):
        attrs = super(LocationObject, self).__dir__()
        attrs.extend(['lat', 'lng'])
        return attrs

    @property
    def coords(self):
        return self.lng, self.lat

    @property
    def xy_coords(self):
        pass
