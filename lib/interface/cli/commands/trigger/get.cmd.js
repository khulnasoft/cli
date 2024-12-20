require('debug')('khulnasoft:cli:get:triggers');
const _ = require('lodash');
const Command = require('../../Command');
const Output = require('../../../../output/Output');
const getRoot = require('../root/get.cmd');
const { sdk } = require('../../../../logic');
const Trigger = require('../../../../logic/entities/Trigger');

const command = new Command({
    command: 'triggers',
    aliases: ['trigger', 't'],
    parent: getRoot,
    description: '[Deprecated] Get triggers, optionally filtered by pipeline or event. Deprecated - please use pipeline spec to manager cron triggers',
    usage: 'Only cron/registry triggers are supported (for git triggers use `khulnasoft get pip <pip-name> -o json`)',
    webDocs: {
        category: 'Triggers',
        title: '[Deprecated] Get Triggers',
    },
    builder: (yargs) => {
        yargs
            .option('pipeline', {
                describe: 'pipeline id',
                alias: 'p',
            })
            .option('event-uri', {
                describe: 'event URI',
                alias: 'e',
            });
    },
    handler: async (argv) => {
        const { 'event-uri': event, pipeline } = argv;

        let triggers;
        if (pipeline) {
            triggers = await sdk.triggers.getPipelineTriggers({ pipeline });
        } else if (event) {
            triggers = await sdk.triggers.getEventTriggers({ event });
        } else {
            triggers = await sdk.triggers.list();
        }

        Output.print(_.map(triggers, Trigger.fromResponse));
    },
});

module.exports = command;

