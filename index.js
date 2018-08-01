const cheerio = require('cheerio');
const { group, text, number, attr } = require('./definitions');
const identity = (x) => x;

module.exports = (html, template) => {
  const $ = cheerio.load(html);
  const usesRootGroup = typeof template === 'function';
  const processed = processTemplate($, undefined, usesRootGroup ? { root: template } : template);
  return usesRootGroup ? processed.root : processed;
};

/**
 * Process a template on a single node
 */
function processTemplate($, context, template) {
  const extracted = {};

  // Allow to iterate on a list of element changing context
  function iterate(nestedTemplate) {
    const usesRootGroup = typeof nestedTemplate === 'function';
    return (nestedContext, filter) => {
      const nestedProcessDefinition = createDefinitionProcessor($, nestedContext, iterate);
      return nestedContext
        .filter((i, node) => filter(nestedProcessDefinition))
        .map((i, node) => processTemplate($, node, usesRootGroup ? { root: nestedTemplate } : nestedTemplate))
        .get()
        .map(usesRootGroup ? (value) => value.root : identity);
    };
  }

  const processDefinition = createDefinitionProcessor($, context, iterate);
  Object.keys(template).forEach((key) => {
    if (typeof template[key] === 'function') {
      extracted[key] = processDefinition(template[key]);
    } else if (typeof template[key] === 'object') {
      extracted[key] = processTemplate($, context, template[key]);
    } else {
      extracted[key] = template[key];
    }
  });

  return extracted;
}

function createDefinitionProcessor($, context, iterate) {
  return (definition) => {
    const selectorFn = (selectorString) => selectorString === ':self' ? $(context) : $(selectorString, context);
    const [node, getValue, transform = identity, filter = identity] = definition(selectorFn, iterate);
    const result = node.length > 1 ? node.map((i, el) => getValue($(el), filter)).get() : getValue($(node), filter);
    return transform(result, $, iterate);
  };
}
