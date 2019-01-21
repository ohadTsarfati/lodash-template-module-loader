const _ = require('lodash');
const lodaerUtils = require('loader-utils');


const defaultOptions = {
  //interpolate: _.templateSettings.interpolate,
  //escape: _.templateSettings.escape,
  //evaluate: _.templateSettings.evaluate,
  //variable: _.templateSettings.variable,
  perpendFileNameComment: false,
  asESmodule: false,
  importsModulePath: '',
  enginge: 'lodash',
  globalEngine: false,
  disableImports: false,
};


module.exports = function(source) {
  const template = source;
  let compiledTemplateModule = '';
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

  // Aggregating template settings: interpolate, escape, avaluate, variable. Fallsback to default _.templateSettings object
  _.templateSettings = _.defaults({},
    _.chain(options)
      .pick(['interpolate', 'escape', 'evaluate'])
      .reduce((reduction, val, key) => {
        reduction[key] = new RegExp(val, 'g');
        return reduction;
      }, {})
      .value(),
    _.pick(options, 'variable'),
    _.templateSettings
  );

  const { prependFilenameComment, asESmodule } = options;
  if (prependFilenameComment) {
    template = `<!-- ${path.relative(prependFilenameComment, this.resource)} -->\n${template}`;
  }

  const templateSource = _.template(template).source;

  if (asESmodule) {
    // simply exporting the compiled template as ES6 module
    compiledTemplateModule = `export default ${templateSource};`;
  } else {
    const { importsModulePath, globalEngine, engine, disableImports } = options;
    let imports = '';
    // Checking if imports module has been provided
    if (!_.isEmpty(importsModulePath)) {
      imports = `require('${importsModulePath}')`;
    } else if (engine === 'lodash') { // If no imports module provided and the engine is lodash the imports are the _.templateSettings.imports        
      imports = `(typeof _ !== 'undefined') ? _.templateSettings.imports : {}`;
    }
    // If imports are provided and not explicitly disabling imports
    if (!_.isEmpty(imports) && !disableImports) {
      if (engine !== 'lodash' || engine !== 'underscore') {
        throw new Error(`When using imports the enginge must be either 'lodash' or 'underscore'`);
      }
      if (!globalEngine) {
        compiledTemplateModule = `var _ = require('${engine}');\n`;
      }
      compiledTemplateModule = `${compiledTemplateModule}var imports = ${imports}\n`;
      compiledTemplateModule = `${compiledTemplateModule}module.exports = Function(_.keys(imports), 'return ' + ${templateSource}.toString()).apply(undefined, _.values(imports));`
    } else {
      // When not imports or explicitly disabling it creates simple module export of the compiled template
      compiledTemplateModule = `${compiledTemplateModule}\nmodule.exports = ${templateSource};\n`
    }
  }

  return compiledTemplateModule;
};