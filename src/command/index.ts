import { Command, flags as Flags } from '@oclif/command';
import { Boolean, Optional, Record, Static, String } from 'runtypes';

import { generate } from '../index';

const CmdFlags = Record({
	configFile: String,
	dbUri: Optional(String),
	dryRun: Optional(Boolean),
});
type CmdFlags = Static<typeof CmdFlags>;

export default class SchemaRTCommand extends Command {
	static description = 'Generate runtime and TypeScript definitions of your database schema.';

	static flags: Flags.Input<any> = {
		dryRun: Flags.boolean({
			char: 'd',
			description: "Perform all operations but don't actually generate output",
		}),
		dbUri: Flags.string({
			char: 'u',
			required: false,
			description: 'Database URI. Overrides value in configuration files.',
		}),
		configFile: Flags.string({
			char: 'f',
			description: 'Path to configuration file',
			required: true,
		}),
	};

	async run(): Promise<void> {
		const { flags } = this.parse(SchemaRTCommand);
		const cmdFlags: CmdFlags = CmdFlags.check(flags);

		await generate(cmdFlags);
	}
}
