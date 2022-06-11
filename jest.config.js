const jestConf = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	roots: ['<rootDir>/test/'],
	collectCoverageFrom: ['<rootDir>/src/**/*.ts'],
	coverageThreshold: {
		global: {
			branches: 80,
			functions: 80,
			lines: 80,
		},
	},
	coverageReporters: ['text', 'text-summary', 'html'],
	testRegex: '\\.test\\.ts$',
};

// optimize to not crawl src folder unless in watch mode
if (process.argv.some((x) => x === '--watch' || x === '--watchAll')) {
	jestConf.roots.push('<rootDir>/src/');
}

module.exports = jestConf;
