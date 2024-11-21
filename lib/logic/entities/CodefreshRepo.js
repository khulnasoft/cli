const Entity = require('./Entity');

class KhulnasoftRepo extends Entity {
    constructor(data) {
        super();
        this.entityType = 'khulnasoft-repo';
        this.info = data;
        this.defaultColumns = ['git_context', 'owner', 'name', 'name_id'];
        this.wideColumns = this.defaultColumns.concat([]);
    }

    static fromResponse(response) {
        const data = { ...response };
        data.name_id = response.serviceName;
        data.git_context = response.provider;
        data.owner = response.owner.login;
        data.repo_shortcut = `${data.owner}/${data.name}`;
        return new KhulnasoftRepo(data);
    }
}

module.exports = KhulnasoftRepo;
