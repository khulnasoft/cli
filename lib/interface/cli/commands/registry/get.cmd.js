const debug = require('debug')('khulnasoft:cli:get:cluster');
const _ = require('lodash');
const Command = require('../../Command');
const Output = require('../../../../output/Output');
const getRoot = require('../root/get.cmd');
const Registry = require('../../../../logic/entities/Registry');
const { sdk } = require('../../../../logic');


const command = new Command({
    command: 'registry',
    category: 'Registries',
    parent: getRoot,
    description: 'Get an array of accounts registries',
    webDocs: {
        category: 'Registries',
        title: 'Get Registries',
    },
    builder: (yargs) => {
        return yargs
            .example('khulnasoft get registry', 'Get all registries connected to the account');
    },
    handler: async (argv) => {
        const registries = await sdk.registries.list();
        Output.print(_.map(registries, Registry.fromResponse));
    },
});

module.exports = command;

