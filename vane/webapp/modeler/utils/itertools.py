"""Itertools recipes."""
from __future__ import absolute_import, division, print_function

from collections import Iterable
from itertools import count, islice, tee

__all__ = ['dedupe', 'flatten', 'pairwise', 'tabulate', 'take']


def dedupe(items, key=None):
    """Remove duplicate values in a sequence, but preserve order of remaining \
        items.

    Parameters
    ----------
    items : sequence
    key : {None, function}, optional
        function that converts sequence items into a hashable type for
        the purposes of duplicate detection.

    Returns
    -------
    sequence of unique items

    Examples
    --------
    >>> a = [{'x': 1, 'y': 2}, {'x': 1, 'y': 3},
    ...      {'x': 1, 'y': 2}, {'x': 2, 'y': 4}]
    >>> list(dedupe(a, key=lambda d: (d['x'], d['y'])))
    [{'x': 1, 'y': 2}, {'x': 1, 'y': 3}, {'x': 2, 'y': 4}]
    >>> list(dedupe(a, key=lambda d: d['x']))
    [{'x': 1, 'y': 2}, {'x': 2, 'y': 4}]

    """
    seen = set()
    for item in items:
        val = item if key is None else key(item)
        if val not in seen:
            yield item
            seen.add(val)


def flatten(items, ignore_types=(str, bytes)):
    """Yields single sequence of values with no nesting :ref:`[PythonCookbook]`

    Parameters
    ----------
    items : sequence
        nested sequence that you want to flatten into a single sequence with
        no nesting
    ignore_types : :class:`~python:tuple`, optional
        :class:`~python:tuple` of :class:`~python:collections.abc.Iterable`
        :class:`~python:type`\ s to that should not be interpreted as
        :class:`~python:collections.abc.Iterable`\ s to be flattened.
        Default is (:class:`~python:str`, :class:`~python:bytes`) to
        prevent strings and bytes from being interpreted as iterables
        and expanded as individual characters.

    Yields
    ------
    sequence
        single sequence with no nesting

    Examples
    --------
    >>> items = [1, 2, [3, 4, [5, 6], 7], 8]
    >>> from modeler.utils import flatten
    >>> items = list(flatten(items))
    >>> print(items)
    [1, 2, 3, 4, 5, 6, 7, 8]

    """
    for x in items:
        if isinstance(x, Iterable) and not isinstance(x, ignore_types):
            # yield from flatten(x)
            for y in flatten(x):
                yield y
        else:
            yield x


def tabulate(function, start=0):
    """Return an iterator mapping `function` over linear input.
    Returns function(0), function(1), ...

    Parameters
    ----------
    function : callable
    start : :class:`~python:int`
        The start argument will be increased by 1 each time the iterator
        is called and fed into `function`.

    Returns
    -------
    :class:`~python:collections.abc.Iterator`

    Examples
    --------
    >>> from modeler.utils import tabulate, take
    >>> t = tabulate(range, 10)
    >>> take(5, t)
    [0, 1, 2, 3, 4]
    >>> take(5, t)
    [5, 6, 7, 8, 9]
    """
    return map(function, count(start))


def take(n, iterable):
    """Return first n items of the iterable as a list.

    Parameters
    ----------
    n : :class:`~python:int`
    iterable : :class:`collections.abc.Iterable`

    Returns
    -------
    :class:`~python:list`

    Examples
    --------
    >>> from modeler.utils import take, tabulate
    >>> t = tabulate(lambda i: i)
    >>> take(5, t)
    [0, 1, 2, 3, 4]
    >>> take(5, t)
    [5, 6, 7, 8, 9]
    """
    return list(islice(iterable, n))


def pairwise(iterable):
    """Returns an iterator of paired items, overlapping, from the original.

    Examples
    --------
    >>> from modeler.utils import pairwise, tabulate, take
    >>> t = tabulate(lambda i: i)
    >>> take(5, pairwise(t))
    [(0, 1), (1, 2), (2, 3), (3, 4), (4, 5)]
    >>> take(5, pairwise(t))
    [(6, 7), (7, 8), (8, 9), (9, 10), (10, 11)]

    """

    a, b = tee(iterable)
    next(b, None)
    return zip(a, b)
