const extract = require('../index');
const { input } = require('../definitions');

const { readFile } = require('./help');

describe('Input fields in <form> elements', () => {
  it('extracts input names and values', () => {
    const html = readFile('../samples/w3schools-form-input-types.html');
    const json = require('../samples/w3schools-form-input-types.js');

    const template = {
      inputs: input('#main input'),
    };
    expect(extract(html, template)).toEqual(json);
  });
});
