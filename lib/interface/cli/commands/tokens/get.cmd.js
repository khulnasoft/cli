const _ = require('lodash');
const Command = require('../../Command');
const getCmd = require('../root/get.cmd');
const Token = require('../../../../logic/entities/Token');
const Output = require('../../../../output/Output');
const { sdk } = require('../../../../logic');

const command = new Command({
    command: 'tokens [names|ids..]',
    aliases: ['token'],
    parent: getCmd,
    description: 'Get Khulnasoft tokens',
    usage: 'Provide names/ids to filter results by them',
    webDocs: {
        category: 'Tokens',
        title: 'Get tokens',
        weight: 20,
    },
    builder: (yargs) => {
        return yargs
            .positional('names', {
                describe: 'Token names or ids',
            })
            .example('khulnasoft get tokens', 'Get all tokens')
            .example('khulnasoft get tokens [token_1_name] [token_2_id]', 'Get tokens filtered by names or ids');
    },
    handler: async (argv) => {
        let res = await sdk.tokens.list();
        res = _.map(res, Token.fromResponse);
        if (!_.isEmpty(argv.names)) {
            res = res.filter(t => argv.names.includes(t.info.name) || argv.names.includes(t.info.id));
        }
        Output.print(res);
    },
});

module.exports = command;

