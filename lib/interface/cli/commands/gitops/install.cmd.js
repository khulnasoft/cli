/* eslint-disable max-len */
const _ = require('lodash');
const Command = require('../../Command');
const installRoot = require('../root/install.cmd');

const PROVIDERS = {
    khulnasoft: require('./khulnasoft/install'),
    'argocd-agent': require('./argocd/install'),
};

const installArgoCmd = new Command({
    root: false,
    parent: installRoot,
    command: 'gitops <provider>',
    description: 'Install gitops',
    webDocs: {
        category: 'Gitops',
        title: 'Install',
        weight: 100,
    },
    builder: yargs => yargs
        .env('CF_ARG_')
        .positional('provider', {
            describe: 'Gitops provider',
            choices: ['khulnasoft', 'argocd-agent'],
            required: true,
        })
        .option('git-integration', {
            describe: 'Name of git integration in Khulnasoft',
        })
        .option('git-repo-url', {
            describe: 'Url to manifest repo',
        })
        .option('khulnasoft-integration', {
            describe: 'Name of gitops integration in Khulnasoft ( Please create a dedicated context for the agent to  avoid hitting the Github rate limits )',
        })
        .option('argo-host', {
            describe: 'Host of argocd installation',
        })
        .option('argo-token', {
            describe: 'Token of argocd installation. Preferred auth method',
        })
        .option('argo-username', {
            describe: 'Username of existing argocd installation. Should be used with argo-password',
        })
        .option('argo-password', {
            describe: 'Password of existing argocd installation. Should be used with argo-username',
        })
        .option('update', {
            describe: 'Update gitops integration if exists',
        })
        .option('kube-config-path', {
            describe: 'Path to kubeconfig file (default is $HOME/.kube/config)',
        })
        .option('kube-context-name', {
            describe: 'Name of Kubernetes context',
        })
        .option('kube-namespace', {
            describe: 'Namespace in Kubernetes cluster',
        })
        .option('in-cluster', {
            type: 'boolean',
            default: false,
            describe: 'Use this option if gitops provider is been updated from inside a cluster',
        })
        .option('output', {
            describe: 'Path to k8s manifest output file, example: -o /home/user/out.yaml',
            alias: 'o',
        })
        .option('sync-mode', {
            choices: ['NONE', 'SELECT', 'CONTINUE_SYNC', 'ONE_TIME_SYNC'],
            describe: 'Synchronization mode\nNONE - don\'t synchronize\nSELECT - select applications for synchronization\nCONTINUE_SYNC - continuous synchronization\nONE_TIME_SYNC - synchronize one time',
        })
        .option('sync-apps', {
            array: true,
            describe: 'Applications to be synchronized',
        })
        .option('http-proxy', {
            describe: 'http proxy to be used in the runner',
        })
        .option('https-proxy', {
            describe: 'https proxy to be used in the runner',
        })
        .option('install-manifest', {
            describe: 'Url of argocd install manifest',
            default: 'https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml',
        })
        .option('set-argo-password', {
            describe: 'Set password for admin user of new argocd installation',
        })
        .option('khulnasoft-host', {
            describe: 'Khulnasoft api host',
            default: 'https://g.khulnasoft.com/',
        })
        .option('khulnasoft-agent-suffix', {
            describe: 'Suffix for agent application\'s resources. Can be used for installing multiple agents in one namespace',
            default: '',
        })
        .option('values', {
            describe: 'Specify values in a YAML file',
        })
        .option('bypass-download', {
            describe: 'Will bypass the attempt to download the installer. Instead, will immediately attempt to use the binary from the components folder',
            default: false,
            type: 'boolean',
        }),

    handler: async (argv) => {
        const { provider } = argv;

        const providerInstaller = PROVIDERS[provider];
        return providerInstaller.install(argv);
    },
});

module.exports = installArgoCmd;
