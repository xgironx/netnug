from __future__ import absolute_import, division, print_function

import json

__all__ = ['serialize_instance', 'deserialize_object',
           'write_json', 'load_json']


def serialize_instance(obj):
    """Return a JSON serializable dict representation of object instance."""
    d = {'__classname__': type(obj).__name__}
    d.update(vars(obj))
    return d


def deserialize_object(d):
    """Return object representation from serialized obj."""
    pass


def write_json(data, fpath):
    with open(fpath, 'wt') as fh:
        json.dump(data, fh, indent=4, sort_keys=True)


def load_json(fpath):
    with open(fpath, 'rt') as data:
        json_data = json.load(data)
    return json_data

