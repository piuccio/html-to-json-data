const url = require('url');

/**
 * Extract the text content of a selected node
 */
exports.text = select(asText);

/**
 * Extract the text of multiple nodes and guarantees results are unique
 */
exports.uniq = select(asText).transform(
  (list) => Object.keys(list.reduce((all, value) => Object.assign(all, { [value]: value }), {}))
);

/**
 * Extract the text content of a node and coverts to a Number,
 * returns 0 if node is missing
 */
exports.number = select(asText, (text) => Number(text) || 0);

/**
 * Extract the attribute / property / data of a node as text
 */
['attr', 'prop', 'data'].forEach((fn) => {
  exports[fn] = select((node, name) => node[fn](name));
});

/**
 * Special treatment for href / src attributes. If the link is relative,
 * converts it to absolute using the base URI
 */
['href', 'src'].forEach((name) => {
  exports[name] = select((node, base) => url.resolve(base, node.attr(name) || ''));
});

exports.input = select((node) => ({
  type: node.attr('type'),
  name: node.attr('name'),
  value: node.attr('value'),
}));

/**
 * Logically group nested selectors.
 * Returns a function that can be used as is, or calling `.slice()`
 * to limit the number of results
 *
 * `selector` can either be a string or a function that will be called with
 * - $, cheerio node (root, or the current scoped group)
 */
exports.group = (selector, template) => {
  const reducers = [];
  const filters = [];
  function withInterface(fn) {
    fn.slice = (...args) => {
      reducers.push((list) => list.slice(...args));
      return fn;
    };
    fn.flat = () => {
      reducers.push((list) => list.reduce((acc, val) => acc.concat(val), []));
      return fn;
    };
    fn.filterBy = (filterDefinition, filterFn) => {
      filters.push((applyDefinition) => filterFn(applyDefinition(filterDefinition)));
      return fn;
    };
    return fn;
  }
  function applyReducers(list = []) {
    return reducers.reduce((prevResult, reducer) => reducer(prevResult), list);
  }
  function applyFilters(applyDefinition) {
    return filters.reduce((prevResult, filter) => prevResult && filter(applyDefinition), true);
  }
  const selectorFn = typeof selector === 'string' ? ($) => $(selector) : selector;
  return withInterface(($, iterate) => [selectorFn($), iterate(template), applyReducers, applyFilters]);
};

function select(...fns) {
  const resultSelector = (transform) => (selector, ...args) => ($) => [
    $(selector),
    (node) => fns.reduce((prevResult, fn) => fn(prevResult, ...args), node),
    transform
  ];
  const withDefaultTransform = resultSelector();
  withDefaultTransform.transform = resultSelector;
  return withDefaultTransform;
}

function asText(node) {
  return node.text().trim();
}
