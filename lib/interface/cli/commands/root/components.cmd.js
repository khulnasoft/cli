const Command = require('../../Command');


const install = new Command({
    root: true,
    command: 'components',
    description: 'Manages Khulnasoft CLI components',
    requiresAuthentication: false,
    webDocs: {
        description: 'Khulnasoft CLI components',
        category: 'Khulnasoft CLI components',
        title: 'components',
        weight: 40,
    },
});

module.exports = install;
