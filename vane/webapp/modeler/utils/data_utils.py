"""Data parsing helper functions."""
from __future__ import absolute_import, print_function

import modeler

__all__ = ['generate_network', 'parse_json_network']


def generate_network(data):
    """Return a `Subnet` instance from json data dictionary."""
    return modeler.classes.Subnet.from_dict(data)


def parse_json_network(data):
    """Parse JSON data and return tuple of `Nodes`, `Links`, and `Demands`.

    Parameters
    ----------
    data : `dict`

    Returns
    -------
    `tuple`

    """
    return (modeler.classes.Nodes.from_dict(data),
            modeler.classes.Links.from_dict(data),
            modeler.classes.Demands.from_dict(data))
