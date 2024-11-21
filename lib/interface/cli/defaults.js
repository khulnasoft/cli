const { homedir } = require('os');
const path = require('path');

const DEFAULTS = {
    URL: 'https://g.khulnasoft.com',
    CFCONFIG: `${process.env.HOME || process.env.USERPROFILE}/.cfconfig`,
    DEBUG_PATTERN: 'khulnasoft',
    GET_LIMIT_RESULTS: 25,
    GET_ALL_PIPELINES_LIMIT: 10000,
    GET_PAGINATED_PAGE: 1,
    INTERNAL_REGISTRY_PREFIX: 'CFCR',
    WATCH_INTERVAL_MS: 3000,
    MAX_CONSECUTIVE_ERRORS_LIMIT: 10,
    KHULNSOFT_PATH: path.resolve(homedir(), '.Khulnasoft'),
    ENGINE_IMAGE: process.env.ENGINE_IMAGE || 'khulnasoft/engine:master',
};

module.exports = DEFAULTS;
