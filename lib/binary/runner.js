const { spawn } = require('child_process');
const { join, resolve } = require('path');
const { homedir } = require('os');

const KHULNSOFT_PATH = resolve(homedir(), '.Khulnasoft');

class Runner {
    constructor(location = KHULNSOFT_PATH) {
        this.location = location;
    }

    async run(component, args) {
        const dir = join(this.location, component.local.dir);
        const path = component.local.alternateBinary || join(dir, component.local.binary);
        const cp = spawn(path, args, {
            stdio: [process.stdin, process.stdout, process.stderr],
        });
        return new Promise((resolveFn, rejectFn) => {
            cp.on('exit', (code) => {
                if (code !== 0) {
                    rejectFn(new Error(`Component exited with status code ${code}`));
                } else {
                    resolveFn();
                }
            });
        });
    }
}

module.exports = { Runner };
