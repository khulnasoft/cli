const yargs = require('yargs');
const Command = require('../../Command');
const path = require('path');
const fs = require('fs');

/**
 * yargs script generation file redone
 * */
function _generateCompletionScript(appPath, appName, completionCommand, shell) {
    let script = fs.readFileSync(
        path.resolve(__dirname, `${shell}.sh.hbs`),
        'utf-8',
    );
    const name = appName || path.basename(appPath);

    script = script.replace(/{{app_name}}/g, name);
    script = script.replace(/{{completion_command}}/g, completionCommand);
    return script.replace(/{{app_path}}/g, appPath);
}

const command = new Command({
    root: true,
    command: 'completion [shell-name]',
    requiresAuthentication: false,
    aliases: ['completions'],
    description: 'Generate khulnasoft completion',
    usage: 'Prints completion script with specified or default path to executable and command alias',
    webDocs: {
        category: 'Completion',
        title: 'Khulnasoft Completion',
        description: 'Generate khulnasoft completion. See details on [usage](khulnasoft-completion)',
        weight: 30,
    },
    builder: (yargs) => {
        return yargs
            .positional('shellName', {
                description: 'Name of the shell to generate completion for',
                choices: ['bash', 'zsh'],
                default: 'bash',
            })
            .option('executable', {
                alias: 'e',
                description: 'Name or path to your khulnasoft executable (default same as alias)',
            })
            .option('alias', {
                alias: 'a',
                description: 'Alias used for calling khulnasoft executable',
                default: 'khulnasoft',
            })
            .example('khulnasoft completion', 'Print bash completion script')
            .example('khulnasoft completion zsh', 'Print zsh completion script')
            .example('khulnasoft completion zsh >> ~/.zshrc', 'Install zsh completion script')
            .example('khulnasoft completion bash >> ~/.bashrc', 'Install bash completion script')
            .example('khulnasoft completion bash >> ~/.bash_profile', 'Install bash completion script (on OSX)')
            .example('cf completion --alias cf', 'Print completion script for khulnasoft aliased as "cf"')
            .example('/some/path/khulnasoft completion -e /some/path/khulnasoft', 'Print completion script with specified path to khulnasoft executable');
    },
    handler: async (argv) => {
        const { executable, alias: appName, shellName } = argv;
        const appPath = executable || appName;
        const script = _generateCompletionScript(appPath, appName, 'completion', shellName);
        console.log(script);
    },
});

module.exports = command;
