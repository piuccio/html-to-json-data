const cheerio = require('cheerio');
const { group, text, number, attr } = require('./definitions');
const identity = (x) => x;

module.exports = (html, template) => {
  const $ = cheerio.load(html);
  return processTemplate($, undefined, template);
};

/**
 * Process a template on a single node
 */
function processTemplate($, context, template) {
  const extracted = {};

  // Allow to iterate on a list of element changing context
  function iterate(nestedTemplate) {
    return (nestenestedContext) => nestenestedContext.map((i, node) => processTemplate($, node, nestedTemplate)).get();
  }

  Object.keys(template).forEach((key) => {
    if (typeof template[key] === 'function') {
      const definitionImplementationFn = template[key];
      const selectorFn = (selectorString) => selectorString === ':self' ? $(context) : $(selectorString, context);
      const [node, getValue, transform = identity] = definitionImplementationFn(selectorFn, iterate);
      const result = node.length > 1 ? node.map((i, el) => getValue($(el))).get() : getValue($(node));
      extracted[key] = transform(result);
    } else {
      extracted[key] = template[key];
    }
  });

  return extracted;
}
