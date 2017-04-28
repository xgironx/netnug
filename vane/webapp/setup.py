#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Setup script for webapp modeler package

You can install the modeler with

python setup.py install
"""
from glob import glob
import os
import sys
if os.path.exists('MANIFEST'):
    os.remove('MANIFEST')

from setuptools import setup

if sys.argv[-1] == 'setup.py':
    print("To install, run 'python setup.py install'")
    print()

if sys.version_info[:2] < (2, 7):
    print("Install requires Python 2.7 or later (%d.%d detected)." %
          sys.version_info[:2])
    sys.exit(-1)

# Write the version information.
# sys.path.insert(0, 'modeler')
# import release
# version = release.write_versionfile()
# sys.path.pop(0)

packages = ["modeler",
            "modeler.classes",
            "modeler.tests",
            "modeler.testing",
            "modeler.utils"]

# add the tests
package_data = {
    'modeler': ['tests/*.py'],
    'modeler.classes': ['tests/*.py'],
    'modeler.testing': ['tests/*.py'],
    'modeler.utils': ['tests/*.py']
}

install_requires = []

if __name__ == "__main__":

    setup(
        name='vane.webapp.modeler',
        version=0.1,
        packages=packages,
        package_data=package_data,
        install_requires=install_requires,
        test_suite='nose.collector',
        tests_require=['nose>=0.10.1'],
        zip_safe=False
    )
