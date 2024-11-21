const Command = require('../../Command');
const yargs = require('yargs');

const generate = new Command({
    root: true,
    command: 'generate',
    description: 'Generate resources as Kubernetes image pull secret and Khulnasoft Registry token',
    usage: 'Khulnasoft generate --help',
    webDocs: {
        title: 'generate',
        weight: 70,
    },
    handler: async () => {
        yargs.showHelp();
    },
});

module.exports = generate;
