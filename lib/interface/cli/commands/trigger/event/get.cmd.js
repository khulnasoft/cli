require('debug')('khulnasoft:cli:get:trigger-event');
const _ = require('lodash');
const Command = require('../../../Command');
const Output = require('../../../../../output/Output');
const getRoot = require('../../root/get.cmd');
const { sdk } = require('../../../../../logic');
const TriggerEvent = require('../../../../../logic/entities/TriggerEvent');


const command = new Command({
    command: 'trigger-events [event-uri]',
    aliases: ['trigger-event', 'te'],
    parent: getRoot,
    description: '[Deprecated] Get `trigger-event`. Deprecated - please use pipeline spec to manager cron trigger',
    webDocs: {
        category: 'Triggers',
        title: '[Deprecated] Get Trigger Event',
    },
    builder: (yargs) => {
        yargs
            .positional('event-uri', {
                describe: 'trigger-event URI)',
            })
            .option('type', {
                describe: 'trigger-event type',
                default: '',
            })
            .option('kind', {
                describe: 'trigger-event kind',
                default: '',
            })
            .option('filter', {
                describe: 'trigger-event URI filter (regex)',
                default: '',
            })
            .option('public', {
                describe: 'get public trigger-event(s)',
                default: true,
                type: 'boolean',
            })
            .example('khulnasoft get trigger-event registry:dockerhub:khulnasoft:fortune:push', 'Get DockerHub khulnasoft/fortune push `trigger-event`')
            .example('khulnasoft get trigger-event --type registry --kind dockerhub --filter *khulnasoft', 'Get all DockerHub khulnasoft/* push `trigger-events`');
    },
    handler: async (argv) => {
        const uri = argv['event-uri'];
        const { type, kind, filter, public: isPublic } = argv;
        let events;
        if (typeof uri === 'undefined') {
            events = await sdk.triggers.events.list({ type, kind, filter, public: isPublic });
        } else {
            events = [await sdk.triggers.events.get({ event: uri })];
        }

        Output.print(_.map(events, TriggerEvent.fromResponse));
    },
});

module.exports = command;

