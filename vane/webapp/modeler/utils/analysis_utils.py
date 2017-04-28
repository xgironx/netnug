"""Miscellaneous helper functions."""
from __future__ import absolute_import, division, print_function

from collections import Counter

import numpy as np

import modeler

from .itertools import pairwise

__all__ = ['validate_route_nodes', 'validate_route_links',
           'validate_route_bandwidth']


def validate_route_nodes(link_nodes):
    """Filter function to validate a list of path nodes.

    Parameters
    ----------
    link_nodes : list

    Returns
    -------
    valid_nodes : function

    """
    def valid_nodes(path):
        """Nested function closure returned by calls to enclosing function.

        Parameters
        ----------
        path : list

        Returns
        -------
        True/False

        """
        return all([link in link_nodes for link in pairwise(path)])
    return valid_nodes


def validate_route_links(network_links):
    """Filter function to validate a list of path links.

    Parameters
    ----------
    network_links : `Links`

    Returns
    valid_links : function

    """
    if not isinstance(network_links, modeler.classes.Links):
        raise ValueError('Expected a `Links` object for `network_links`')

    def valid_links(path):
        """Nested function closure returned by calls to enclosing function.

        Parameters
        ----------
        path : list

        Returns
        -------
        True if link is found in `path`, False otherwise.

        """
        links = \
            network_links.__class__(
                [network_links.get(link) for link in pairwise(path)])
        return np.sum(links.costs) != np.inf
    return valid_links


def validate_route_bandwidth(shared_routes, traffic):
    """Filter function to validate route bandwidth.

    Parameters
    ----------
    shared_routes : `Routes`
    traffic : numpy.ndarray

    Returns
    -------
    valid_bandwidth : function

    """
    load_balance = len(shared_routes)
    shared_links = \
        Counter(link.id for route in shared_routes for link in route.links)

    def valid_bandwidth(route):
        """Nested function closure returned by calls to enclosing function.

        Parameters
        ----------
        route : `Route`

        Returns
        -------
        True if all route links have sufficient bandwidth to handle traffic
        load, False otherwise

        """
        return all([np.max(link.traffic[:, 1] +
                           shared_links[link.id] *
                           traffic[:, 1] / load_balance) <= link.capacity
                    for link in route.links])
    return valid_bandwidth
