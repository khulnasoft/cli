const Command = require('../../Command');
const { sdk } = require('../../../../logic');
const createRoot = require('../root/create.cmd');


const command = new Command({
    command: 'agent <name>',
    parent: createRoot,
    description: 'Create an agent',
    usage: 'Create an agent used to behind firewall integration.',
    webDocs: {
        category: 'Agents',
        title: 'Create Agent',
    },
    builder: yargs => yargs
        .positional('name', {
            describe: 'Name of agent',
        })
        .option('runtimes', {
            array: true,
            alias: 'r',
            describe: 'Agent runtimes',
            default: [],
        })
        .example('khulnasoft create agent NAME', 'Create an agent')
        .example('khulnasoft create agent NAME -r runtime1 -r runtime2', 'Create an agent with runtimes: [ "runtime1", "runtime2"]'),
    handler: async (argv) => {
        const {
            name,
            runtimes,
        } = argv;

        const agent = await sdk.agents.create({ name, runtimes });
        console.log(`Agent: "${agent.name}" created`);
        console.log(agent.token);
    },
});

module.exports = command;
