/* eslint-disable no-eval */
/* eslint-disable jest/expect-expect */
/* eslint-disable no-console */
import Path from 'path';

import ts from 'typescript';

import { generate } from '../../src';

describe('generate postgres', () => {
	let schema: string;

	beforeAll(async () => {
		schema = await generate({
			configFile: Path.join(__dirname, 'schemart.yaml'),
			dbUri: 'mysql://mysql:mysql@localhost:3307/schemart',
			dryRun: true,
		});
	});

	it('should generate the correct schema runtypes', () => {
		const result = ts.transpile(schema);
		const output = eval(result);

		console.log(output);
		expect(output.GenderEnum).toBeTruthy();
		expect(output.Users).toBeTruthy();
		expect(output.BlogPosts).toBeTruthy();
	});
});
