/* eslint-disable no-eval */
/* eslint-disable jest/expect-expect */
/* eslint-disable no-console */
import Path from 'path';

import ts from 'typescript';

import { generate } from '../../src';

describe('generate mssql', () => {
	let schema: string;

	beforeAll(async () => {
		schema = await generate({
			configFile: Path.join(__dirname, 'schemart.yaml'),
			dbUri: 'Server=localhost,1433;Database=master;User Id=SA;Password=SA_Pass!234;Encrypt=false',
			dryRun: true,
		});
	});

	it('should generate the correct schema runtypes', () => {
		console.log(schema);

		const result = ts.transpile(schema);
		const output = eval(result);
		expect(output.Users).toBeTruthy();
		expect(output.BlogPosts).toBeTruthy();
	});
});
