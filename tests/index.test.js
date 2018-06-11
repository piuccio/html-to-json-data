const extract = require('../index');
const { group, text, number, href, src, uniq } = require('../definitions');

const { readFile } = require('./help');

describe('Extract data from HTML pages', () => {
  it('extracts data with CSS selectors', () => {
    const html = readFile('../samples/github-piuccio-repositories.html');
    const json = require('../samples/github-piuccio-repositories.js');

    const template = {
      page: 'GitHub',
      name: text('.vcard-fullname'),
      nickname: text('.vcard-username'),
      avatar: src('img.avatar', 'https://github.com'),
      languages: uniq('span[itemprop="programmingLanguage"]'),
      repos: group('#user-repositories-list li', {
        name: text('h3'),
        link: href('h3 a', 'https://github.com'),
        stars: number('a[href$="stargazers"]'),
      }),
    };
    expect(extract(html, template)).toEqual(json);
  });

  it('allows to slice groups when CSS is not enough', () => {
    const html = readFile('../samples/github-piuccio-repositories.html');

    const template = {
      repos: group('#user-repositories-list li', {
        name: text('h3'),
      }).slice(1, 2),
    };
    expect(extract(html, template)).toEqual({
      repos: [{
        name: 'cowsay',
      }],
    });
  })
});
