# lodash-template-module-loader

[Webpack](https://webpack.js.org/) loader for [Lodash](https://lodash.com/docs#template)/[Underscore](https://underscorejs.org/#template) templates

### Installation

    npm install --save-dev lodash-template-module-loader

### Usage

Set up the loader in your webpack configuration:

```js
module.exports = {
    //...
    module: {
        rules: [
            {
                test: /(\.tpl\.html)$/,
                loader: 'lodash-template-module-loader',
                options: {
                   // ...
                   // ...
                }
            }
        ]
    }
};
```

This will allow you to `require` / `import` and use templates like this:

##### template.tpl.html
```html
<h1><%= title %></h1>
```

##### myScript.js - with require
```js
var template = require('./path/to/template.tpl.html');
var html = template({
    title: 'Hello world'
});
```
##### myScript.js - import
```js
import template from './path/to/template.tpl.html';
const html = template({
    title: 'Hello world'
});
```

## Configuration Options

By default, you get variable interpolation, escaping (`_.escape`), and evaluation (`<%= thing %>`, `<%- escapedThing %>`, and `<% if (thing) { %>...<% } %>`, respectively).

There are a number of configuration options available ({type} option = default):

* `{boolean} globalEngine = false`
* `{string} engine = "lodash"`
* `{string} importsModulePath = ""`
* `{string} importsName = "imports"`
* `{string} prependFilenameComment = ""`
* `{RegExp|string} interpolate = /<%=([\s\S]+?)%>/g`
* `{RegExp|string} escape = /<%-([\s\S]+?)%>/g`
* `{RegExp|string} evaluate = /<%([\s\S]+?)%>/g`
* `{string} variable = ""`

#### Templating Engine - "globalEngine" & "engine"

The `engine` option describes the imported template engine - default: `'lodash'`. You can use this to specify `'underscore'`, if you want.

The `globalEngine` flag indicates whether Lodash/Underscore's `_` is already included globally.
The default value is `false` - results in import statement to include the `engine`. Set `globalEngine: true` in your config options to remove the import statement - `_` will be presumed to be available for use in your templates.


#### Template Imports - "importsModulePath" & "importsName"

It is possible to specify a module to use for imports. `importsModulePath` lets you specify module that exports some template util imports.

```js
module.exports = {
    // ...
    module: {
        rules: [
            {
                test: /(\.tpl\.html)$/,
                loader: 'lodash-template-module-loader',
                options: {
                    importsModulePath: path.join(__dirname, 'template-imports'),
                    // ...
                }
            }
        ]
    },
    // ...
};
```
The imports module's default export is available as `importsDefault`, all other named exports are scoped to `imports` variable (using `* as imports`).

It is possible to rename the named imports scope setting `importsName`.

##### template-imports.js

```js
export function greet(str) {
    return `Hello ${str}`;
};
```
##### template.tpl.html

```html
<p><%- imports.greet(name) %> ! ! !</p>
```
##### myModule.js

```js
import template from 'path/to/template.tpl.html';
const html = template({name: 'Jon'}); // "<p>Hello Jon ! ! !</p>"
```

#### Template Settings - "escape", "evaluate", "interpulate", "variable"

You can modify the regular expressions that Lodash uses for [`interpolate`](https://lodash.com/docs#templateSettings-interpolate), [`escape`](https://lodash.com/docs#templateSettings-escape), and [`evaluate`](https://lodash.com/docs#templateSettings-evaluate):

```js
module.exports = {
    // ...
    module: {
        rules: [
            {
                test: /(\.tpl\.html)$/,
                loader: 'lodash-template-module-loader',
                options: {
                    escape: /\{\{(.+?)\}\}/g,
                    evaluate: /\{%([\s\S]+?)%\}/g,
                    interpolate: /\{\\[(.+?)\\]\\}/g,
                    //...
                }
            }
        ]
    },
    // ...
};
```

You can also specify the [`variable`](https://lodash.com/docs#templateSettings-variable) option, which can be used to namespace the variables you pass into the template:

```js
module.exports = {
    // ...
    module: {
        rules: [
            {
                test: /(\.tpl\.html)$/,
                loader: 'lodash-template-module-loader',
                options: {
                    variable: 'data',
                    // ...
                }
            }
        ]
    },
    // ...
};
```

##### template.tpl.html

```html
<h1><%- data.title %></h1>
<p><%- data.description %></p>
```

##### myModule.js

```js
import template from './path/to/template.tpl';
const html = template({
    title: 'My Title',
    description: 'Lorem ipsum...',
});
```

### Prepending Filename Comment - "prependFilenameComment"

When debugging using DevTools, it can be hard to find the template in the Elements panel. With the following config an HTML comment is prepended to the template with the relative path in it (e.g. `<!-- src/templates/my-view.tpl.html -->`).

```js
module.exports = {
    // ...
    module: {
        rules: [
            {
                test: /(\.tpl\.html)$/,
                loader: 'lodash-template-module-loader',
                options: {
                    prependFilenameComment: process.cwd(),
                    // ...
                }
            }
        ]
    },
    // ...
};
```

### License

[MIT License](LICENSE)

---

This project is inspired by [lodash-template-webpack-loader](https://github.com/kmck/lodash-template-webpack-loader). 

##### So why another loader? 
Please see [motivation](Motivation.md).