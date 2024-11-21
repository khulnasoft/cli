const gitopsUpgrader = require('../common/upgrade');

class KhulnasoftGitopsUpgrade {
    // eslint-disable-next-line class-methods-use-this
    async upgrade(argv) {
        return gitopsUpgrader.upgrade(argv);
    }
}
module.exports = new KhulnasoftGitopsUpgrade();
