/* eslint-disable max-len */
const Command = require('../../Command');
const uninstallRoot = require('../root/uninstall.cmd');
const inquirer = require('inquirer');
const {
    selectRuntime,
    mergeWithValues,
    selectNamespace,
} = require('./helper');
const colors = require('colors');
const sdk = require('../../../../logic/sdk');
const _ = require('lodash');
const { to } = require('../../../../logic/cli-config/errors/awaitTo');
const {
    createErrorHandler,
    drawKhulnasoftFiglet,
    unInstallAppProxy,
    INSTALLATION_DEFAULTS,
} = require('../hybrid/helper');
const { getKubeContext } = require('../../helpers/kubernetes');

const openIssueMessage = `If you had any issues with the uninstallation process please report them at: ${colors.blue('https://github.com/khulnasoft/cli/issues/new')}`;
const handleError = createErrorHandler(openIssueMessage);

async function promptConfirmationMessage() {
    const answer = await inquirer.prompt({
        type: 'confirm',
        name: 'deletionConfirmed',
        default: false,
        message: 'Are you sure you want to delete the app-proxy-component? (default is NO)',
    });
    if (!answer.deletionConfirmed) {
        console.log('Deletion process aborted, exiting...');
        process.exit(1);
    }
}

const uninstallAppProxyHandler = new Command({
    root: false,
    parent: uninstallRoot,
    command: 'app-proxy',
    description: 'Deletes the App-Proxy component from your Kubernetes cluster',
    webDocs: {
        category: 'App-Proxy',
        title: 'Uninstall',
        weight: 100,
    },
    builder: yargs => yargs
        .env('CF_ARG_') // this means that every process.env.CF_ARG_* will be passed to argv
        .option('kube-context-name', {
            describe: 'Name of the kubernetes context on which the app-proxy is installed'
                + ' (default: current context) [$CF_ARG_KUBE_CONTEXT_NAME]',
        })
        .option('kube-namespace', {
            describe: 'Name of the kubernetes namespace from which the App-Proxy and Runtime should be removed',
        })
        .option('kube-config-path', {
            describe: 'Path to kubeconfig file (default is $HOME/.kube/config)',
            default: INSTALLATION_DEFAULTS.KUBECONFIG_PATH,

        })
        .option('runtime-environment', {
            describe: 'The Khulnasoft runtime-environment that this App-Proxy will be associated with',
            type: 'string',
        })
        .option('force', {
            describe: 'Run the delete operation without asking to confirm (use with caution!)',
            alias: 'f',
            type: Boolean,
        })
        .option('values', {
            describe: 'specify values in a YAML file',
        })
        .option('set-value', {
            describe: 'Set values for templates, example: --set-value LocalVolumesDir=/mnt/disks/ssd0/khulnasoft-volumes',
            type: 'array',
        })
        .option('verbose', {
            describe: 'Print logs',
        })
        .option('bypass-download', {
            describe: 'Will bypass the attempt to download the installer. Instead, will immediately attempt to'
                + ' use the binary from the components folder',
            default: false,
            type: 'boolean',
        }),
    handler: async (_argv) => {
        const argv = mergeWithValues(_argv);
        const {
            'kube-config-path': kubeConfigPath,
            force,
            verbose,
            values,
            'set-value': setValues,
            noExit,
            'bypass-download': bypassDownload,
        } = argv;
        let {
            'kube-namespace': kubeNamespace,
            'kube-context-name': kubeContextName,
            'runtime-environment': runtimeEnvironment,
        } = argv;

        const [listReErr, runtimes] = await to(sdk.runtimeEnvs.list({ }));
        await handleError(listReErr, 'Failed to get runtime environments');
        const runtimeNames = runtimes.reduce((acc, re) => {
            if (_.get(re, 'metadata.agent')) {
                acc.push(_.get(re, 'metadata.name'));
            }
            return acc;
        }, []);

        if (_.isEmpty(runtimeNames)) {
            await handleError(
                new Error('no runtime environments found'),
                'Cannot uninstall app-proxy without a Khulnasoft runtime-environment',
            );
        }

        console.log(colors.green('This uninstaller will guide you through the App-Proxy uninstallation process'));

        if (!kubeContextName) {
            kubeContextName = getKubeContext(kubeConfigPath);
        }

        if (!kubeNamespace) {
            kubeNamespace = await selectNamespace();
        }

        if (!runtimeEnvironment || !runtimeNames.find(re => re === runtimeEnvironment)) {
            if (runtimeEnvironment) {
                console.log(colors.bold(`Runtime-environment "${colors.cyan(runtimeEnvironment)}" `
                    + 'was not found, please choose on of the following:'));
            }
            runtimeEnvironment = await selectRuntime(runtimeNames);
        }

        console.log(`\n${colors.green('Uninstallation options summary:')} 
1. Kubernetes Context: ${colors.cyan(kubeContextName)}
2. Kubernetes Namespace: ${colors.cyan(kubeNamespace)}
3. Runtime name: ${colors.cyan(runtimeEnvironment)}
`);

        if (!force) {
            await promptConfirmationMessage();
        }

        const [uninstallErr] = await to(unInstallAppProxy({
            kubeConfigPath,
            kubeContextName,
            kubeNamespace,
            verbose,
            valuesFile: values,
            setValue: setValues,
            bypassDownload,
        }));
        await handleError(uninstallErr, 'Failed to uninstall app-proxy');

        const [getREErr, re] = await to(sdk.runtimeEnvs.get({ name: runtimeEnvironment }));
        await handleError(getREErr, 'Failed to get runtime environment');
        delete re.appProxy;

        console.log(`updating runtime-environment ${colors.cyan(runtimeEnvironment)} `);
        await sdk.runtimeEnvs.update({ name: runtimeEnvironment }, re);

        console.log('Successfully uninstalled App-Proxy');
        console.log(openIssueMessage);
        await drawKhulnasoftFiglet();
        if (!noExit) {
            process.exit(); // TODO : This is not needed - needed to be fixed
        }
    },
});

module.exports = uninstallAppProxyHandler;
