/* eslint-disable max-len */
const Command = require('../../Command');
const installRoot = require('../root/install.cmd');
const { DefaultLogFormatter } = require('./../hybrid/helper');
const { downloadVeonona } = require('../hybrid/helper');
const { Runner, components } = require('../../../../binary');
const sdk = require('../../../../logic/sdk');
const _ = require('lodash');

const installMonitorCmd = new Command({
    root: false,
    parent: installRoot,
    command: 'monitor',
    description: 'Install and create an cluster resources monitor on kubernetes cluster',
    webDocs: {
        category: 'Monitor',
        title: 'Install',
        weight: 100,
    },
    builder: yargs => yargs
        .env('CF_ARG_') // this means that every process.env.CF_ARG_* will be passed to argv
        .option('cluster-id', {
            describe: 'Cluster id - freestyle name',
        })
        .option('token', {
            describe: 'Khulnasoft user token',
        })
        .option('kube-config-path', {
            describe: 'Path to kubeconfig file (default is $HOME/.kube/config)',
            type: 'string',
        })
        .option('kube-context-name', {
            describe: 'Name of the kubernetes context on which monitor should be installed [$CF_ARG_KUBE_CONTEXT_NAME]',
        })
        .option('url', {
            describe: 'Khulnasoft url, by default https://g.khulnasoft.com',
        })
        .option('kube-namespace', {
            describe: 'Name of the namespace on which monitor should be installed [$CF_ARG_KUBE_NAMESPACE]',
        })
        .option('docker-registry', {
            describe: 'The prefix for the container registry that will be used for pulling the required components images. Example: --docker-registry="docker.io"',
            type: 'string',
        })
        .option('values', {
            describe: 'specify values in a YAML file',
        })
        .option('verbose', {
            describe: 'Print logs',
        })
        .option('dry-run', {
            describe: 'dry run',
            default: false,
            type: 'boolean',
        })
        .option('bypass-download', {
            describe: 'If the flag is set, then the first attempt (to get the required component) would be by searching for it locally. If the search fails, there will be a download attempt',
            default: false,
            type: 'boolean',
        }),
    handler: async (argv) => {
        const {
            url,
            //     'kube-config-path': kubeConfigPath,
            'cluster-id': clusterId,
            token,
            'kube-config-path': kubeConfigPath,
            'kube-context-name': kubeContextName,
            'kube-namespace': kubeNamespace,
            'docker-registry': dockerRegistry,
            verbose,
            values: valuesFile,
            'env-vars': envVars,
            'set-value': setValue,
            'set-file': setFile,
            'dry-run': dryRun,
            'bypass-download': bypassDownload,
            //        noExit,
        } = argv;
        const binLocation = await downloadVeonona(undefined, bypassDownload);
        const componentRunner = new Runner(binLocation);

        const commands = [
            'install',
            'monitor',
        ];

        if (clusterId) {
            commands.push('--clusterId');
            commands.push(clusterId);
        }

        commands.push('--khulnasoftToken');
        if (token) {
            commands.push(token);
        } else {
            commands.push(_.get(sdk, 'config.context.token'));
        }

        if (kubeConfigPath) {
            commands.push('--kube-config-path');
            commands.push(kubeConfigPath);
        }

        if (kubeContextName) {
            commands.push('--kube-context-name');
            commands.push(kubeContextName);
        }

        // if (helm3) {
        //     commands.push('--helm3');
        // }

        if (kubeNamespace) {
            commands.push('--kube-namespace');
            commands.push(kubeNamespace);
        }

        if (url) {
            commands.push('--khulnasoftHost');
            commands.push(url);
        }
        if (verbose) {
            commands.push('--verbose');
        }
        if (DefaultLogFormatter) {
            commands.push(`--log-formtter=${DefaultLogFormatter}`);
        }

        if (dockerRegistry) {
            commands.push(`--docker-registry=${dockerRegistry}`);
        }
        if (valuesFile) {
            commands.push(`--values=${valuesFile}`);
        }
        if (setFile) {
            commands.push(`--set-file=${setFile}`);
        }
        if (setValue) {
            if (_.isArray(setValue)) {
                setValue.forEach(sv => commands.push(`--set-value=${sv}`));
            } else {
                commands.push(`--set-value=${setValue}`);
            }
        }
        if (envVars) {
            envVars.forEach((item) => {
                const parts = item.split('=');
                commands.push(`--set-value=EnvVars.${parts[0]}=${parts[1].replace(/,/g, '\\,')}`);
            });
        }
        if (dryRun) {
            commands.push('--dry-run');
        }

        await componentRunner.run(components.venona, commands);
    },
});

module.exports = installMonitorCmd;
