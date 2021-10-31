import { Command, flags as Flags } from '@oclif/command';
import { Boolean, Optional, Record, Static, String } from 'runtypes';

import { generate } from '../index';

const CmdFlags = Record({
	'config-file': String,
	'db-uri': Optional(String),
	'dry-run': Optional(Boolean),
});
type CmdFlags = Static<typeof CmdFlags>;

export default class SchemaRTCommand extends Command {
	static description = 'Generate Runtype and Typescript definitions of database schema.';

	static flags: Flags.Input<any> = {
		'dry-run': Flags.boolean({
			char: 'd',
			description: "Perform all operations but don't actually generate output",
		}),
		'db-uri': Flags.string({
			char: 'u',
			required: false,
			description: 'Database URI. Overrides value in configuration files.',
		}),
		'config-file': Flags.string({
			char: 'f',
			description: 'Path to configuration file',
			required: true,
		}),
	};

	async run(): Promise<void> {
		const { flags } = this.parse(SchemaRTCommand);
		const cmdFlags: CmdFlags = CmdFlags.check(flags);

		await generate(cmdFlags['config-file'], cmdFlags['db-uri']);
	}
}
