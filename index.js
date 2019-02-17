const path = require('path');

let _;
try {
  _ = require('lodash');
} catch(error) {
  _ = require('underscore')
}

const loaderUtils = require('loader-utils');

const defaultOptions = {
  // interpolate: _.templateSettings.interpolate,
  // escape: _.templateSettings.escape,
  // evaluate: _.templateSettings.evaluate,
  // variable: _.templateSettings.variable,
  perpendFileNameComment: '',
  importsModulePath: '',
  importsName: 'imports',
  engine: 'lodash',
  globalEngine: false,
};

module.exports = function(source) {
  let template = source;
  
  // caching
  this.cacheable && this.cacheable();

  // get user options
  const userPref = loaderUtils.getOptions(this);

  // aggrgate the options
  const options = _.defaults(
    {},
    userPref,
    defaultOptions
  );

  // aggregate template settings: interpolate, escape, avaluate, variable.
  // fallsback to default _.templateSettings object
  _.templateSettings = _.defaults({}, _.chain(options).
    pick(['interpolate', 'escape', 'evaluate']).
    reduce((reduction, val, key) => {
      reduction[key] = _.isRegExp(val) ? val : new RegExp(val, 'g');
      return reduction;
    }, {}).
    value(),
    _.pick(options, 'variable'),
    _.templateSettings
  );

  const {
    importsModulePath,
    importsName,
    prependFileNameComment,
    globalEngine,
    engine,
  } = options;

  const modulePieces = [];

  // import engine if not global
  if (!globalEngine) {
    modulePieces.push(`import _ from '${engine}';`);
  }
  
  // importing imports module
  if (!_.isEmpty(importsModulePath)) {
    this.addDependency(path.resolve(importsModulePath));
    modulePieces.push(`import ${importsName}Default, * as ${importsName} from '${importsModulePath}';`)
  }

  // append file name comment
  if (!_.isEmpty(prependFileNameComment) && _.isString(prependFileNameComment)) {
    template = `<!-- ${path.relative(prependFileNameComment, this.resource)} -->\n ${template}`;
  }

  // generate template source
  const templateSource = _.template(template).source;

  modulePieces.push(`export default ${templateSource};\n`);

  // return compiled template as ES6 module
  return modulePieces.join('\n');
};
