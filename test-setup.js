const _ = require('lodash');
const request = require('requestretry');
const sdk = require('./lib/logic/sdk');
const { Config } = require('khulnasoft-sdk');
const openapi = require('./openapi');

jest.mock('./lib/output/Output');
jest.mock('khulnasoft-sdk/helpers/whoami', () => ({
    getUser: jest.fn().mockResolvedValue(),
    getExecutionContext: jest.fn().mockResolvedValue(),
    getCurrentAccount: jest.fn().mockResolvedValue(),
}));
jest.mock('request-promise', () => (() => ({ options: { request: {} } })));

let SDK_CONFIGURED;

global.verifyResponsesReturned = async (responses) => {
    const { results } = request.mock;
    let returnedResponses = _.map(results, r => r.value);
    returnedResponses = await Promise.all(returnedResponses);
    expect(returnedResponses).toEqual(responses);
};

/**
 * downloads spec one time for all tests
 * */
global.configureSdk = async () => {
    Object.keys(sdk).forEach(key => delete sdk[key]);
    sdk.configure(await Config.load({
        url: 'http://not.needed',
        apiKey: 'not-needed',
        spec: { json: openapi },
    }));
};
