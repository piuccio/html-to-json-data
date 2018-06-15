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

  it('allows to filter groups by nested selectors', () => {
    const html = readFile('../samples/github-cowsay-files.html');
    const inTheLastMonth = ['cows', 'browser.js', 'package.json'];
    const referenceDate = new Date(2018, 4, 15);

    const template = group('.file-wrap tr', text('.content'))
      .filterBy(attr('time-ago', 'datetime'), (date) => new Date(date) > referenceDate);
    expect(extract(html, template)).toEqual(inTheLastMonth);
  });

  it('flattens results when filtering array results', () => {
    const html = readFile('../samples/jreast-timetable.html');
    const earlyMorning = ['23', '49', '10', '21', '26']; // results are spliced

    const template = group('.timetable tr', text('.minute'))
      .filterBy(number('td:first-child'), (hour) => hour === 5 || hour === 6)
      .flat()
      .slice(0, 5);
    expect(extract(html, template)).toEqual(earlyMorning);
  });
});
