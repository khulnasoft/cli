let createCmd = require('./create.cmd');
let replaceCmd = require('./replace.cmd');
let deleteCmd = require('./delete.cmd');
let versionCmd = require('./version.cmd');
let approveCmd = require('../workflow/approve.cmd');
let denyCmd = require('../workflow/approve.cmd');
let validateCmd = require('./validate.cmd');

createCmd.requiresAuthentication = false;
replaceCmd.requiresAuthentication = false;
deleteCmd.requiresAuthentication = false;
versionCmd.requiresAuthentication = false;
approveCmd.requiresAuthentication = false;
denyCmd.requiresAuthentication = false;
validateCmd.requiresAuthentication = false;

createCmd = createCmd.toCommand();
replaceCmd = replaceCmd.toCommand();
deleteCmd = deleteCmd.toCommand();
versionCmd = versionCmd.toCommand();
approveCmd = approveCmd.toCommand();
denyCmd = denyCmd.toCommand();
validateCmd = validateCmd.toCommand();

jest.mock('../../helpers/validation', () => { // eslint-disable-line
    return {
        validatePipelineSpec: async () => ({ valid: true }),
        validatePipelineYaml: async () => ({ valid: false }),
    };
});

const request = require('requestretry');

const DEFAULT_RESPONSE = request.__defaultResponse();

describe('root commands', () => {
    beforeEach(async () => {
        request.__reset();
        request.mockClear();
        await configureSdk(); // eslint-disable-line
    });

    describe('create', () => {
        describe('context', () => {
            it('should handle creation from spec', async () => {
                const argv = {
                    filename: {
                        kind: 'context',
                        metadata: {
                            name: 'name',
                        },
                    },
                };
                await createCmd.handler(argv);
                await verifyResponsesReturned([DEFAULT_RESPONSE]); // eslint-disable-line
            });
        });

        describe('pipeline', () => {
            it('should handle creation from spec', async () => {
                const argv = {
                    filename: {
                        kind: 'pipeline',
                        metadata: {
                            name: 'name',
                        },
                    },
                };
                await createCmd.handler(argv);
                await verifyResponsesReturned([DEFAULT_RESPONSE]); // eslint-disable-line
            });
        });
    });

    describe('delete', () => {
        describe('context', () => {
            it('should handle deletion by spec', async () => {
                const argv = {
                    filename: {
                        kind: 'context',
                        metadata: {
                            name: 'name',
                        },
                    },
                };
                await deleteCmd.handler(argv);
                await verifyResponsesReturned([DEFAULT_RESPONSE]); // eslint-disable-line
            });
        });

        describe('pipeline', () => {
            it('should handle deletion by spec', async () => {
                const argv = {
                    filename: {
                        kind: 'pipeline',
                        metadata: {
                            name: 'name',
                        },
                    },
                };
                await deleteCmd.handler(argv);
                await verifyResponsesReturned([DEFAULT_RESPONSE]); // eslint-disable-line
            });
        });
    });

    describe('replace', () => {
        describe('context', () => {
            it('should handle replacing by spec', async () => {
                const argv = {
                    filename: {
                        kind: 'context',
                        metadata: {
                            name: 'name',
                        },
                    },
                };
                await replaceCmd.handler(argv);
                await verifyResponsesReturned([DEFAULT_RESPONSE]); // eslint-disable-line
            });
        });

        describe('pipeline', () => {
            it('should handle replacing by spec', async () => {
                const argv = {
                    filename: {
                        kind: 'pipeline',
                        metadata: {
                            name: 'name',
                        },
                    },
                };
                await replaceCmd.handler(argv);
                await verifyResponsesReturned([DEFAULT_RESPONSE]); // eslint-disable-line
            });
        });
    });

    describe('validate', () => {
        describe('Not valid yaml ', () => {
            it('should throw error for not valid file', async () => {
                const argv = {
                    filenames: ['./__mocks__/khulnasoft.yml'],
                };
                const result = await validateCmd.handler(argv)
                    .catch(err => err);
                expect(result instanceof Error).toBe(true);
            });
        });
    });

    describe('version', () => {
        describe('api', () => {
            it('should handle getting version', async () => {
                const argv = { component: 'api' };
                await versionCmd.handler(argv);
                await verifyResponsesReturned([DEFAULT_RESPONSE]); // eslint-disable-line
            });
        });

        describe('hermes', () => {
            it('should handle getting version', async () => {
                const argv = { component: 'hermes' };
                await versionCmd.handler(argv);
                await verifyResponsesReturned([DEFAULT_RESPONSE]); // eslint-disable-line
            });
        });

        describe('nomios', () => {
            it('should handle getting version', async () => {
                const argv = { component: 'nomios' };
                await versionCmd.handler(argv);
                await verifyResponsesReturned([DEFAULT_RESPONSE]); // eslint-disable-line
            });
        });
    });

    describe('Approve pending-approval workflow', () => {
        it('should handle approve from spec', async () => {
            const argv = {
                buildId: 'buildId',
            };
            await approveCmd.handler(argv);
            await verifyResponsesReturned([DEFAULT_RESPONSE, DEFAULT_RESPONSE]); // eslint-disable-line
        });
    });

    describe('Deny pending-approval workflow', () => {
        it('should handle deny from spec', async () => {
            const argv = {
                buildId: 'buildId',
            };
            await denyCmd.handler(argv);
            await verifyResponsesReturned([DEFAULT_RESPONSE, DEFAULT_RESPONSE]); // eslint-disable-line
        });
    });
});
