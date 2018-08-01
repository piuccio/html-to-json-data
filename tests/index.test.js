const extract = require('../index');
const { group, text, number, href, src, uniq, attr } = require('../definitions');

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
  });

  it('extract data from a form element', () => {
    const html = readFile('../samples/jreast-timetable-search.html');
    const json = require('../samples/jreast-timetable-search.js');

    const template = {
      formUrl: attr('.line form', 'action'),
      prefectures: group('#selectToken option', {
        name: text(':self'),
        value: attr(':self', 'value'),
      }).slice(1),
    };
    expect(extract(html, template)).toEqual(json);
  });

  it('allows to have definitions in a nested object', () => {
    const html = readFile('../samples/github-piuccio-repositories.html');

    const template = {
      stats: {
        total: number('a[title="Repositories"] .Counter'),
      },
      repos: group('#user-repositories-list li', {
        details: {
          name: text('h3'),
          author: 'piuccio',
        },
      }).slice(1, 2),
    };
    expect(extract(html, template)).toEqual({
      stats: {
        total: 43,
      },
      repos: [{
        details: {
          name: 'cowsay',
          author: 'piuccio',
        },
      }],
    });
  });
});
