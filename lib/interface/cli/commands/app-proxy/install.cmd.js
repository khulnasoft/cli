const colors = require('colors');

const _ = require('lodash');
const Command = require('../../Command');
const installRoot = require('../root/install.cmd');
const {
    INSTALLATION_DEFAULTS,
    installAppProxy,
    createErrorHandler,
    drawKhulnasoftFiglet,
} = require('../hybrid/helper');
const { getKubeContext } = require('../../helpers/kubernetes');
const sdk = require('../../../../logic/sdk');
const { to } = require('../../../../logic/cli-config/errors/awaitTo');
const {
    mergeWithValues,
    selectRuntime,
    selectNamespace,
    selectHost,
} = require('./helper');

const openIssueMessage = 'If you had any issues with this installation process please report them at:'
    + ` ${colors.blue('https://github.com/khulnasoft/cli/issues/new')}`;
const handleError = createErrorHandler(openIssueMessage);

function printInstallationOptionsSummary({
    kubeContextName,
    kubeNamespace,
    host,
    runtimeEnvironment,
}) {
    const summary = `\n${colors.green('Installation options summary:')} 
    1. Kubernetes Context: ${colors.cyan(kubeContextName)}
    2. Kubernetes Namespace: ${colors.cyan(kubeNamespace)}
    3. App-Proxy hostname: ${colors.cyan(host)}
    4. Runtime-Environment: ${colors.cyan(runtimeEnvironment)}
   `;
    console.log(summary);
}


const installAppProxyHandler = new Command({
    root: false,
    parent: installRoot,
    command: 'app-proxy',
    description: 'Installs the App-Proxy component on your Kubernetes cluster',
    webDocs: {
        category: 'App-Proxy',
        title: 'Install',
        weight: 100,
    },

    builder: yargs => yargs
        .env('CF_ARG_') // this means that every process.env.CF_ARG_* will be passed to argv
        .option('kube-config-path', {
            describe: 'Path to kubeconfig file [$KUBECONFIG]',
            default: INSTALLATION_DEFAULTS.KUBECONFIG_PATH,
            type: 'string',
        })
        .option('kube-context-name', {
            describe: 'Name of the kubernetes context on which the app-proxy should be installed'
                + ' (default: current context) [$CF_ARG_KUBE_CONTEXT_NAME]',
        })
        .option('kube-namespace', {
            describe: 'Name of the namespace on which app-proxy should be installed (default:'
                + ` ${INSTALLATION_DEFAULTS.NAMESPACE}) [$CF_ARG_KUBE_NAMESPACE]`,
            type: 'string',
        })
        .option('runtime-environment', {
            describe: 'The Khulnasoft runtime-environment that this app-proxy will be associated with',
            type: 'string',
        })
        .option('docker-registry', {
            describe: 'The prefix for the container registry that will be used for pulling the app-proxy component image',
            default: 'docker.io',
            type: 'string',
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
        .option('host', {
            describe: 'the hostname that will be used by the app-proxy ingress',
            type: 'string',
        })
        .option('ingress-class', {
            describe: 'the ingress class that will be used by the app-proxy ingress',
            type: 'string',
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
            'docker-registry': dockerRegistry,
            verbose,
            values,
            'set-value': setValues,
            'ingress-class': ingressClass,
            noExit,
            'bypass-download': bypassDownload,
        } = argv;
        let {
            host,
            'kube-namespace': kubeNamespace,
            'kube-context-name': kubeContextName,
            'runtime-environment': runtimeEnvironment,
        } = argv;

        const [listReErr, runtimes] = await to(sdk.runtimeEnvs.list({ }));
        await handleError(listReErr, 'Failed to get account\'s runtime environments');
        const runtimeNames = runtimes.reduce((acc, re) => {
            if (_.get(re, 'metadata.agent')) {
                acc.push(_.get(re, 'metadata.name'));
            }
            return acc;
        }, []);

        if (_.isEmpty(runtimeNames)) {
            await handleError(
                new Error('no runtime environments found'),
                'Cannot install app-proxy without a Khulnasoft runtime-environment',
            );
        }

        if (!kubeContextName) {
            kubeContextName = getKubeContext(kubeConfigPath);
        }

        if (!kubeNamespace) {
            kubeNamespace = await selectNamespace();
        }

        if (!host) {
            host = await selectHost();
        }

        if (!runtimeEnvironment || !runtimeNames.find(re => re === runtimeEnvironment)) {
            if (runtimeEnvironment) {
                console.log(colors.bold(`Runtime-environment "${colors.cyan(runtimeEnvironment)}" `
                    + 'was not found, please choose on of the following:'));
            }
            runtimeEnvironment = await selectRuntime(runtimeNames);
        }

        printInstallationOptionsSummary({
            kubeContextName,
            kubeNamespace,
            host,
            runtimeEnvironment,
        });

        console.log('installing app-proxy...');
        const [installationErr] = await to(installAppProxy({
            apiHost: sdk.config.context.url,
            appProxyHost: host,
            appProxyIngressClass: ingressClass,
            kubeConfigPath,
            kubeContextName,
            kubeNamespace,
            dockerRegistry,
            bypassDownload,
            valuesFile: values,
            setValue: setValues,
            verbose,
        }));
        await handleError(installationErr, 'Failed to install app-proxy');

        const [getREErr, re] = await to(sdk.runtimeEnvs.get({ name: runtimeEnvironment }));
        await handleError(getREErr, 'Failed to get runtime environment');

        const appProxyUrl = `https://${host}${argv.pathPrefix || ''}`;

        const body = {
            appProxy: {
                externalIP: appProxyUrl,
            },
        };
        console.log(`updating runtime-environment ${colors.cyan(runtimeEnvironment)} with app-proxy url`);
        await sdk.runtimeEnvs.update({ name: runtimeEnvironment }, _.merge(re, body));
        console.log(`runtime-environment ${colors.cyan(runtimeEnvironment)} updated`);

        console.log(openIssueMessage);
        await drawKhulnasoftFiglet();
        if (!noExit) {
            process.exit();
        }
    },

});

module.exports = installAppProxyHandler;
