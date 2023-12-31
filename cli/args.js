module.exports = args;

var abbrev = require('abbrev');
var alias = abbrev('version', 'debug', 'help', 'quiet', 'interactive', 'dev');
alias.d = 'debug'; // always make `-d` debug

function args(processargv) {
  // allows us to support flags with true or false only
  var argv = processargv.slice(2).reduce(function reduce(acc, arg) {
    if (arg.indexOf('-') === 0) {
      arg = arg.slice(1);

      if (alias[arg] !== undefined) {
        acc[alias[arg]] = true;
      } else if (arg.indexOf('-') === 0) {
        acc[arg.slice(1)] = true;
      } else {
        acc[arg] = true;
      }
    } else {
      acc._.push(arg);
    }

    return acc;
  }, { _: [] });

  // by passing `-d` to the cli, we enable the debugging output, but this must
  // be as early as possible in the cli logic to capture all the output
  if (argv.debug) {
    require('debug').enable('khulnasoft');
  }

  var debug = require('debug')('khulnasoft');

  // this is done after the debug activation line above because we want to see
  // the debug messaging when we use the `-d` flag
  var cli = require('./commands');

  // the first argument is the command we'll execute, everything else will be
  // an argument to our command, like `khulnasoft help protect`
  var command = argv._.shift();

  // alias switcheroo - allows us to have
  if (cli.aliases[command]) {
    command = cli.aliases[command];
  }

  // alias `-v` to `khulnasoft version`
  if (argv.version) {
    command = 'version';
  }

  if (!command || argv.help || command === 'help') {
    // bit of a song and dance to support `khulnasoft -h` and `khulnasoft help`
    if (argv.help === true || command === 'help') {
      argv.help = 'help';
    }
    command = 'help';

    if (!argv._.length) {
      argv._.unshift(argv.help || 'usage');
    }
  }

  if (command && command.indexOf('config:') === 0) {
    // config looks like `config:set x=y` or `config:get x`
    // so we need to mangle the commands into this format:
    // khulnasoft.config('set', 'api=x')
    // khulnasoft.config('get', 'api') // etc
    var tmp = command.split(':');
    command = tmp.shift();
    argv._.unshift(tmp.shift());
  }

  var method = cli[command];

  if (!method) {
    // if we failed to find a command, then default to an error
    if (!method) {
      method = require('./error');
      argv._.push(command);
    }
  }

  if (command === 'protect' ||
      command === 'test') {
    // copy all the options across to argv._ as an object
    argv._.push(argv);
  }

  debug(command, argv);

  return {
    method: method,
    command: command,
    options: argv,
  };
}