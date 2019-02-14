const path = require('path');

const _ = require('lodash');
const lodaerUtils = require('loader-utils');


const defaultOptions = {
  // interpolate: _.templateSettings.interpolate,
  // escape: _.templateSettings.escape,
  // evaluate: _.templateSettings.evaluate,
  // variable: _.templateSettings.variable,
  perpendFileNameComment: '',
  asESmodule: false,
  importsModulePath: '',
  engine: 'lodash',
  globalEngine: false,
  disableImports: false,
};


module.exports = function(source) {
  let template = source;
  let compiledTemplate = '';
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
        reduction[key] = new RegExp(val, 'g');
        return reduction;
      }, {}).
      value(),
  _.pick(options, 'variable'),
  _.templateSettings
  );

  const {
    prependFileNameComment,
    asESmodule,
    globalEngine,
    engine,
  } = options;

  // append file name comment
  if (!_.isEmpty(prependFileNameComment) && _.isString(prependFileNameComment)) {
    template = `<!-- ${path.relative(prependFileNameComment, this.resource)} -->\n ${template}`;
  }

  const templateSource = _.template(template).source;

  if (asESmodule) {
    if (!globalEngine) {
      compiledTemplate = `import _ from '${engine}';\n`;
    }
    // simply exporting the compiled template as ES6 module
    return `${compiledTemplate}export default ${templateSource};`;
  }

  const {
    importsModulePath,
    disableImports,
  } = options;

  let imports = '';
  // Checking if imports module has been provided
  if (!_.isEmpty(importsModulePath)) {
    imports = `require('${importsModulePath}')`;
  } else if (engine === 'lodash') {
    // If no imports module provided and the engine is lodash the imports are the _.templateSettings.imports
    imports = `(typeof _ !== 'undefined') ? _.templateSettings.imports : {}`;
  }

  if (!globalEngine) {
    compiledTemplate = `var _ = require('${engine}');\n`;
  }
  // If imports are provided and not explicitly disabling imports
  if (!_.isEmpty(imports) && !disableImports) {
    if (engine !== 'lodash' && engine !== 'underscore') {
      throw new Error(`When using imports the engine must be either 'lodash' or 'underscore'`);
    }
    return `${compiledTemplate}var imports = ${imports};\n` +
    `module.exports = Function(_.keys(imports), ` +
    `'return ' + ${templateSource}.toString()).apply(undefined, _.values(imports));`;
  } else {
    // When not imports or explicitly disabling it creates simple module export of the compiled template
    return `${compiledTemplate}module.exports = ${templateSource};\n`;
  }
};
