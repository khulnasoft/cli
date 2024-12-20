require('debug')('khulnasoft:cli:delete:trigger-event');

const Command = require('../../../Command');
const deleteRoot = require('../../root/delete.cmd');
const { sdk } = require('../../../../../logic');

const command = new Command({
    command: 'trigger-event [event-uri]',
    aliases: ['te'],
    parent: deleteRoot,
    description: '[Deprecated] Delete `trigger-event`. Deprecated - please use pipeline spec to manager cron trigger',
    webDocs: {
        category: 'Triggers',
        title: '[Deprecated] Delete Trigger Event',
    },
    builder: (yargs) => {
        yargs
            .positional('event-uri', {
                describe: 'trigger-event URI',
            })
            .option('context', {
                describe: 'context with credentials required to setup event on remote system',
            })
            .example('khulnasoft delete trigger-event --context dockerhub registry:dockerhub:khulnasoft:fortune:push', 'Delete registry/dockerhub trigger-event');
    },
    handler: async (argv) => {
        const { 'event-uri': event, context } = argv;
        await sdk.triggers.events.delete({ event, context });
        console.log(`Trigger event: ${argv['event-uri']} was successfully deleted.`);
    },
});

module.exports = command;

