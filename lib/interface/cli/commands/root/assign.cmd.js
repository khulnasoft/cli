const Command = require('../../Command');

const assign = new Command({
    root: true,
    command: 'assign',
    description: 'Assign a resource',
    usage: 'khulnasoft assign --help',
    webDocs: {
        title: 'Assign',
        weight: 70,
    },
    builder: (yargs) => {
        return yargs
            .demandCommand(1, 'You need at least one command before moving on');
    },
});

module.exports = assign;
