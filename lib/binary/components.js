module.exports = {
    stevedore: {
        name: 'Stevedore',
        description: 'Integrate clusters to Khulnasoft',
        version: {
            prefix: 'v',
        },
        local: {
            versionFile: 'version.txt',
            dir: 'Stevedore',
            binary: 'stevedore',
            alternateBinary: process.env.STEVEDORE,
        },
        remote: {
            versionPath: '/',
            versionFile: 'VERSION',
            branch: 'master',
            repo: 'Stevedore',
        },
    },
    venona: {
        name: 'venona',
        description: 'Install required assets on Kubernetes cluster',
        version: {
            prefix: '',
        },
        local: {
            versionFile: 'version.txt',
            dir: 'agent',
            binary: 'venona',
            alternateBinary: process.env.VENONACTL,
        },
        remote: {
            versionPath: 'venonactl',
            versionFile: 'VERSION',
            branch: 'release-1.0',
            repo: 'venona',
        },
    },
    gitops: {
        'argocd-agent': {
            name: 'gitops',
            description: 'Install gitops argocd agent',
            version: {
                prefix: '',
            },
            local: {
                versionFile: 'version.txt',
                dir: 'gitops',
                binary: 'argocd-agent',
            },
            remote: {
                versionPath: 'installer',
                versionFile: 'VERSION',
                branch: 'master',
                repo: 'argocd-agent',
            },
        },
        khulnasoft: {
            name: 'cf-gitops-controller',
            description: 'Install gitops khulnasoft controller',
            version: {
                prefix: '',
            },
            local: {
                versionFile: 'version.txt',
                dir: 'cf-gitops-controller',
                binary: 'cf-gitops-controller',
            },
            remote: {
                versionPath: '/',
                versionFile: 'VERSION',
                branch: 'main',
                repo: 'cf-gitops-controller',
            },
        },
    },
};
