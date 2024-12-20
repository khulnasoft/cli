const _ = require('lodash');
const yargs = require('yargs');
const path = require('path');
const recursive = require('recursive-readdir');

const DEFAULTS = require('./defaults');
const { Config } = require('khulnasoft-sdk');
const { version } = require('../../../package.json');
const configManager = require('../../logic/cli-config/Manager');
const openapi = require('../../../openapi');
const sdk = require('../../logic/sdk');
const cliConfHelpers = require('./helpers/cli-config');

const PROCESS_ARGV = require('yargs-parser')(process.argv);

const cliConfig = configManager.config();

async function getConfigForSdk(options = {}) {
    const configOptions = {
        configPath: PROCESS_ARGV.cfconfig,
        spec: { json: openapi },
        request: _.defaultsDeep({
            timeout: PROCESS_ARGV.requestTimeout,
            headers: {
                'User-Agent': `khulnasoft-cli-v${version}`,
                'Khulnasoft-User-Agent-Type': 'cli',
                'Khulnasoft-User-Agent-Version': version,
            },
        }, cliConfig.request, cliConfHelpers.getSdkConfigForPagination().request),
        allowNoContext: options.allowNoContext,
    };
    return Config.load(configOptions);
}
async function startCommandLine() {
    const allowNoContext = process.argv.join(' ').includes('config use-context');
    const [files, config] = await Promise.all([
        recursive(path.resolve(__dirname, 'commands')),
        getConfigForSdk({ allowNoContext }),
    ]);

    if (!allowNoContext) {
        sdk.configure(config);
    }

    const rootCommands = [];
    _.forEach(files, (file) => {
        if (file.endsWith('.cmd.js')) {
            const command = require(file);
            if (command.isRoot()) {
                if (command.isBetaCommand()) {
                    if (config && config.context && config.context.isBetaFeatEnabled()) {
                        rootCommands.push(command);
                    }
                } else {
                    rootCommands.push(command);
                }
            }
        }
    });
    _.forEach(rootCommands, command => yargs.command(command.toCommand()));

    return yargs // eslint-disable-line
        .env('CF_ARG_') // this means that every process.env.CF_ARG_* will be passed to argv
        .option('cfconfig', {
            describe: `Custom path for authentication contexts config file (default: ${DEFAULTS.CFCONFIG})`,
            global: false,
        })
        .option('insecure', {
            describe: 'disable certificate validation for TLS connections (e.g. to g.khulnasoft.com)',
            type: 'boolean',
            coerce: (insecure) => {
                if (insecure) {
                    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
                }
                return insecure;
            },
        })
        .option('request-timeout', {
            describe: `Request timeout (default: ${cliConfig.request.timeout})`,
            global: false,
        })
        .demandCommand(1, 'You need at least one command before moving on')
        .parserConfiguration({
            'boolean-negation': false,
        })
        .wrap(null)
        .version(false)
        .help('help')
        .epilogue('For more information, find our official documentation at http://cli.khulnasoft.com')
        .argv;
}

module.exports = { startCommandLine, getConfigForSdk };

