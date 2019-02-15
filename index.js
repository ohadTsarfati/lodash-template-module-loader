const path = require('path');

const _ = require('lodash');
const lodaerUtils = require('loader-utils');


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
  const modulePieces = [];
  // Caching
  this.cacheable && this.cacheable();

  // Getting user options
  const userPref = lodaerUtils.getOptions(this);

  // Aggrgating the options
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


  if (!globalEngine) {
    modulePieces.push(`import _ from '${engine}';`);
  }
  if (!_.isEmpty(importsModulePath)) {
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
