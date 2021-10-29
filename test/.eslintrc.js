module.exports = {
	extends: ['plugin:jest/recommended'],
	env: {
		jest: true,
	},
	rules: {
		// ts overrides to be a little looser in tests
		'@typescript-eslint/no-non-null-assertion': ['off'],
		'@typescript-eslint/explicit-function-return-type': ['off'],
		'@typescript-eslint/explicit-member-accessibility': ['off'],
		'@typescript-eslint/no-explicit-any': ['off'],
		'@typescript-eslint/no-object-literal-type-assertion': ['off'],
	},
};
