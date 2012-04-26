var env = module.exports,
    Fs = require('fs');

env.current = null;

env.loadEnvironmentsSync = function(filename) {
  try {
    // read file and split into lines
    var lines = Fs.readFileSync(filename).toString().split('\n');
    // collect lines that don't begin with "//"
    var out = []
    for (_i = 0, _len = lines.length; _i < _len; _i++) {
      if (!(lines[_i].match(/^[ \t]*[\/\/|#]/))) { out.push(lines[_i])}
    }
    // parse the remaining json
    var allEnvs = JSON.parse(out.join(''));
  } catch(e) {
    throw new Error("loadEnvironments: JSON parse error " + e);
  }
  if (typeof allEnvs !== 'object') {
    throw new Error("loadEnvironments: malformed input");
  }

  var envName = process.env['NODE_ENV'];
  if (!envName)
    envName = 'development';

  env.current = allEnvs[envName];
  if (typeof env.current !== 'object') {
    throw new Error("loadEnvironments: environment '" + envName
      + "' is not in the input file");
  }
}

