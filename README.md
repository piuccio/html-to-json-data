Easily allow to convert an HTML page into structured JSON data

# Installation

`npm i html-to-json-data`

# Usage

This module only provides convenient methods to transform an HTML page from string to JSON.
You'll have to fetch your pages through whatever mean you prefer

```js
const convert = require('html-to-json-data');
const { group, text, number, href, src, uniq } = require('html-to-json-data/definitions');

const html = '<html>...</html>'; // in this example https://github.com/piuccio?tab=repositories
const json = convert(html, {
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
});
```

The resulting object looks like the following

```js
{
  page: 'GitHub',
  name: 'Fabio Crisci',
  nickname: 'piuccio',
  avatar: 'https://avatars1.githubusercontent.com/u/680284?s=460&v=4',
  languages: ['JavaScript', 'HTML', 'Python'],
  repos: [{
    name: 'cowsay',
    link: 'https://github.com/piuccio/cowsay',
    stars: 314,
  }, {
    name: 'flat-earth',
    link: 'https://github.com/piuccio/flat-earth',
    stars: 1,
  }], // the list goes on
}
```

Have a look at the tests for more detailed examples.


## Definitions

The functions exported by `html-to-json-data/definitions` allow to select data from the HTML page and convert it to your desired type.

They all take a selector as first parameter. Any selector that is valid for [cheerio](https://github.com/cheeriojs/cheerio#-selector-context-root-) will work.

- [text](#text)
- [uniq](#uniq)
- [number](#number)
- [attr](#attr)
- [href](#href)
- [src](#src)
- [prop](#prop)
- [data](#data)
- [input](#input)
- [group](#group)


### text

`text(selector)` return the text content (trimmed) of the selected node.

If the selector finds multiple nodes, it'll return an array with all selected values.


### uniq

`uniq(selector)` similar to `text` but always return an array of unique values.


### number

`number(selector)` convert the text content to a number, return 0 if the selector doesn't match any element


### attr

`attr(selector, name)` returns the value of the attribute `name` of the node selected by `selector`.

For instance if selector returns `<a title="Link" />`, the definition `attr('a', 'title')` will return `Link`.


### href

`href(selector, baseURI)` convenience method to return the value of the `href` attribute.

Similar to `attr(selector, 'href')` but it resolves relative paths from `baseURI`.


### src

`src(selector, baseURI)` convenience method to return the value of the `src` attribute.

Similar to `attr(selector, 'src')` but it resolves relative paths from `baseURI`.


### prop

`prop(selector, name)` similar to `attr` but returns a property of the node.

For instance in `<input type="checbox" />`, the definition `prop('input', 'checked')` will return `false`.


### data

`data(selector, name)` similar to `attr` but returns the data attribute.

For instance in `<div data-apple-color="pink" />`, the definition `data('div', 'apple-color')` will return `pink`.


### input

`input(selector)` is a utility method to extract the data of a form input.

For instance in `<input type="radio" name="gender" value="fluid">` it'll return `{ type: 'radio', name: 'gender', value: 'fluid' }`.


### group

`group(selector, definitions)` creates a list of objects described by `definitions`.

The selectors inside `definitions` are scoped inside `selector`.

For instance `group('li', { title: text('h3') })` returns an array of objects with `title` extracted from `li h3`.

If you need to access the element selected by `group` selector in a nested definition you can use the special selector `:self`.

For instance

```js
group('select option', {
  value: attr(':self', 'value'),
  name: text(':self'),
});
```

`definitions` can be either an Object with nested data or any other definition provided by the library, for instance

```js
group('table tr', text('td:first-child'));
```

The selector above returns an array of String extracted from the first `td` from every table row.

The `group` function exposes the following function that can be chained to manipulate the list of results.

#### group.slice

If you need to filter out some elements from the list but the CSS selector in not powerful enough you can use
`group('table tr', {}).slice(1, -1)`.

`slice` works exactly like [`Array.prototype.slice`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/slice).


#### group.flat

When your selectors return an array, you can flat the list or results calling `group().flat`.

```js
const html = `
<table>
  <tr>
    <td><a>One</a></td>
    <td><a>Two</a></td>
  </tr>
  <tr>
    <td><a>Thre</a></td>
    <td><a>Four</a></td>
  </tr>
</table>
`;
group('table tr', text('a')); // [ ['One', 'Two'], ['Three', 'Four'] ]
group('table tr', text('a')).flat(); // ['One', 'Two', 'Three', 'Four']
```


#### group.filterBy

Allow complex filtering of the selected group nodes.

`filterBy(definition, filterFn)`

```js
const html =`
<table>
  <tr>
    <td class="price">Free</td>
    <td class="product">One</td>
  </tr>
  <tr>
    <td class="price">Expensive</td>
    <td class="product">Two</td>
  </tr>
</table>
`;

group('table tr', text('.product')).filterBy(text('.price'), (price) => price === 'Free')
// -> ['One']
```

The arguments of `filterBy` are

* `definition` any definition that selects a value from the group node
* `filterFn` gets called with the result of `definition`, Return `true` to keep the value or `false` to skip it.


#### Selector as a function

If the combination of CSS selectors and `filterBy` is not enough you can use a functions instead of a CSS selector string as first argument.

```js
const html =`
<table>
  <tr>
    <td class="price">Free</td>
    <td class="product">One</td>
  </tr>
  <!-- more rows ... -->
</table>
`;

const selector = ($) => $('table').filter((i, table) => $(table).children().length > 5).find('tr');
group(selector, text('.product'));
```

The above selector will iterate over all the table in the page and return all the `tr` included in tables with at least 5 rows.

The selector function receive as argument a [cheerio](https://github.com/cheeriojs/cheerio) object, refer to the documentation for advanced usage.
