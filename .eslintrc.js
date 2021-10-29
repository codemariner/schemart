const rules = require('eslint-config-airbnb-base/rules/imports').rules;
const baseDevDepAllowances = rules['import/no-extraneous-dependencies'][1].devDependencies;

const overrides = {
	'import/extensions': [
		'error',
		'ignorePackages',
		{
			js: 'never',
			mjs: 'never',
			jsx: 'never',
			ts: 'never',
			tsx: 'never',
		},
	],
	'import/no-extraneous-dependencies': [
		'error',
		{
			devDependencies: baseDevDepAllowances.concat([
				'@(dev|test)/**', // folders for development resources, test servers, utils, etc
			]),
		},
	],
	'handle-callback-err': ['error', '^(e|err|error)$'],
	'new-cap': ['error', { newIsCap: true, capIsNew: false }],
	'no-constant-condition': ['error'],
	'no-debugger': ['error'],
	'no-eq-null': ['error'],
	'no-extra-boolean-cast': ['error'],
	'no-label-var': ['error'],
	'no-path-concat': ['error'],
	'no-process-env': ['error'],
	'no-process-exit': ['error'],
	'no-sync': ['error'],
	'no-undef-init': ['error'],
	'no-underscore-dangle': [
		'error',
		{
			allowAfterThis: true,
			allow: [
				// React
				'__html',
				'__PRELOADED_STATE__',

				// Rewire
				'__Rewire__',
				'__ResetDependency__',
				'__reset__',

				// HAL: http://stateless.co/hal_specification.html
				'_embedded',
				'_links',

				// Redux Form
				'_error',

				// Mongo, et al
				'_id',

				// GraphQL
				'__resolverType__',
				'__resolveType',
				'__resolveObject',
				'__typename',

				// Elasticsearch
				'_source',
				'_routing',

				// OCAPI raw field mapping
				'_raw',
			],
		},
	],

	// the base rule seems to be reporting incorrect errors, disable and
	// just use the typescript version
	'no-shadow': 'off',
	'@typescript-eslint/no-shadow': ['error'],

	// rules we don't like
	'max-classes-per-file': ['off'],

	// Typescript Overrides
	'@typescript-eslint/no-explicit-any': ['warn', { ignoreRestArgs: true }],
	'@typescript-eslint/explicit-function-return-type': ['error', { allowExpressions: true }],
	'@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
	'@typescript-eslint/no-unused-vars': [
		'error',
		{
			vars: 'local',
			args: 'after-used',
			argsIgnorePattern: '^_',
			ignoreRestSiblings: true,
		},
	],
	'import/prefer-default-export': ['off'],
	'import/no-cycle': ['off'],
	// tsc generally handles this by enforcing return types
	'consistent-return': ['off'],
	// tsc gives errors on unhandled cases (with some exceptions)
	'default-case': ['off'],
	// import ordering rules
	'import/order': ['error', { 'newlines-between': 'always' }],
	'sort-imports': [
		'error',
		{
			ignoreCase: true,
			ignoreDeclarationSort: true,
			ignoreMemberSort: false,
		},
	],
	// typescript-eslint ^3.0 replaces camelCase with naming convention
	camelcase: 'off',
	// These rules best matched the output of the former camelCase rule
	'@typescript-eslint/naming-convention': [
		'error',
		{
			selector: 'default',
			format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
			leadingUnderscore: 'allow',
		},
		// Allow for `__` prefixed properties, parameters, and methods ex. `__typename`
		{
			selector: ['property', 'parameter', 'method'],
			format: ['camelCase'],
			prefix: ['__'],
			filter: {
				regex: '^__',
				match: true,
			},
		},
	],
	'no-process-env': ['off'],
};

module.exports = {
	extends: [
		'eslint-config-airbnb-base',
		'eslint-config-airbnb-base/rules/strict',
		'plugin:import/typescript',
		'plugin:@typescript-eslint/eslint-recommended',
		'plugin:@typescript-eslint/recommended',
		'prettier',
	],
	rules: overrides,
	parser: '@typescript-eslint/parser',
	parserOptions: {
		sourceType: 'module',
	},
};
