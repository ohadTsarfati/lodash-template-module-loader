# Motivation
This loader's purpose, other than creating compiled lodash templates, is to assist webpack (combined with certain loaders, described below) to effectively perform tree shaking for lodash methods.

In order to reach the smallest bundle size when using lodash, blazemeter recommands in [this blog post](https://www.blazemeter.com/blog/the-correct-way-to-import-lodash-libraries-a-benchmark) to use [babel-plugin-lodash](https://github.com/lodash/babel-plugin-lodash) with [lodash-webpack-plugin](https://github.com/lodash/lodash-webpack-plugin).

babel-lodash-plugin describes a number of limitations for it to perform the cherry-picking of lodash modules. One of the limitations is that __"You must use ES2015 imports to load Lodash"__ (there are few others worth knowing - see the plugin's repository). 
That limitation can be (relatively) easily enforced in your own code. The problem arises when you compile templates with loaders that generate compiled templates consumed with CommonJS.

This loader solves this problem by enabling consumption of the generated template as ES2015 module.

In order to utilize the mentioned optimization, a small change (other than installing and configuring the plugins mentioned above) is required to the webpack config file. Adding babel as part of the loaders chain for the lodash templates.

```js
module.exports = {
    //...
    module: {
        rules: [
            {
                test: /\.tpl\.html$/,
                use: [
                'babel-loader', /* adding 'babel-loader' to the loaders chain */
                {
                    loader: path.resolve('./webpack/template-loader/index.js'),
                    options: {
                        // ...
                    },
                ],
            }
        ]
    }
};
```
