"""String helper functions."""
from __future__ import absolute_import, print_function

__all__ = ['pluralize']


def pluralize(word, count):
    """Make a word plural by adding an *s* if `count` != 1.

    Parameters
    ----------
    word : :class:`~python:str`
        the word
    count : :class:`~python:int`
        the word count

    Returns
    -------
    :class:`~python:str`

    Examples
    --------
    On occasion, it is desirable to describe a numerical value in terms of
    a noun which the number is quantifying. For example, given
    a function which accepts a numerical parameter `n` and returns
    a string describing the number of `n` *objects*, then this
    helper function may be of use. For example::

    >>> from modeler.utils import pluralize
    >>> def apple_count(n):
    ...     return '{} {}'.format(n, pluralize('apple', n))
    ...
    >>> [apple_count(i) for i in range(3)]
    ['0 apples', '1 apple', '2 apples']

    """
    return word if count == 1 else word + 's'
