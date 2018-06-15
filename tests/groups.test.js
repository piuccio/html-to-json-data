const extract = require('../index');
const { group, text, number, href, src, uniq, attr } = require('../definitions');

const { readFile } = require('./help');

describe('Groups data', () => {
  it('allows to use gruoups as root elements', () => {
    const html = readFile('../samples/github-piuccio-repositories.html');
    const json = require('../samples/github-piuccio-repositories.js');

    const template = group('#user-repositories-list li', {
      name: text('h3'),
      link: href('h3 a', 'https://github.com'),
      stars: number('a[href$="stargazers"]'),
    });
    expect(extract(html, template)).toEqual(json.repos);
  });
});
