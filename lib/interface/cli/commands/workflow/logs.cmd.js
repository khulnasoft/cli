const Command = require('../../Command');
const { sdk } = require('../../../../logic');


const run = new Command({
    root: true,
    command: 'logs <id>',
    description: 'Show logs of a build',
    webDocs: {
        category: 'Builds',
        title: 'Show Build Logs',
        weight: 20,
    },
    builder: (yargs) => {
        yargs
            .positional('id', {
                describe: 'Build id',
            })
            .option('f', {
                describe: 'Continue showing build logs until it will finish',
                type: 'boolean',
            })
            .option('no-timestamps', {
                describe: 'Don\'t show timestamps',
                type: 'boolean',
            })
            .example('khulnasoft logs ID', 'Get logs of build ID')
            .example('khulnasoft logs -f ID', 'Get all previous logs of build ID and attach to future logs');

        return yargs;
    },
    handler: async (argv) => {
        const workflowId = argv.id;
        const follow = argv.f;
        const removeTimestamps = argv.noTimestamps

        await sdk.logs.showWorkflowLogs(workflowId, follow, removeTimestamps);
        // TODO fix this. its a workaround since something related to firebase in not properly closed
        process.exit(0);
    },
});

module.exports = run;
