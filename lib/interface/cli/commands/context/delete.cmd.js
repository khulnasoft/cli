const debug = require('debug')('khulnasoft:cli:create:context');
const Command = require('../../Command');
const CFError = require('cf-errors');
const _ = require('lodash');
const deleteRoot = require('../root/delete.cmd');
const { crudFilenameOption } = require('../../helpers/general');
const { sdk } = require('../../../../logic');

const command = new Command({
    command: 'context [name]',
    aliases: ['ctx'],
    parent: deleteRoot,
    description: 'Delete a context',
    webDocs: {
        category: 'Contexts',
        title: 'Delete Context',
    },
    builder: (yargs) => {
        crudFilenameOption(yargs);
        return yargs
            .positional('name', {
                describe: 'Name of context',
            })
            .example('khulnasoft delete context NAME', 'Delete context NAME');
    },
    handler: async (argv) => {
        const name = argv.filename ? _.get(argv.filename, 'metadata.name') : argv.name;

        if (!name) {
            throw new CFError('Name must be provided');
        }

        await sdk.contexts.delete({ name });
        console.log(`Context: ${name} deleted`);
    },
});

module.exports = command;

