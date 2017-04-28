from __future__ import absolute_import, division, print_function

from nose.tools import assert_true, assert_false, assert_equal, assert_not_equal, \
    assert_is_instance
import nose

from modeler.classes import Link, Links

from modeler.testing import NetworkStructuresTestFixture


class Tests(NetworkStructuresTestFixture):

    def test1(self):
        link = self.link
        assert_is_instance(link, Link)
        # print(link)
        # json_link = link.to_json()
        # tmpfile = 'link.json'
        # self.tmpdata.append(tmpfile)
        # with open(tmpfile, 'wt') as f:
        #     f.write(json_link)

        # link_from_json = Link.from_json(json_link)
        # assert_is_instance(link_from_json, Link)
        # assert_equal(link, link_from_json)

    def test2(self):
        links = self.links
        assert_is_instance(links, Links)
        # print(links)
        # json_links = links.to_json()
        # tmpfile = 'links.json'
        # self.tmpdata.append(tmpfile)
        # with open(tmpfile, 'wt') as f:
        #     f.write(json_links)

        # links_from_json = Links.from_json(json_links)
        # assert_is_instance(links_from_json, Links)
        # assert_equal(links, links_from_json)


if __name__ == '__main__':
    nose.runmodule()
