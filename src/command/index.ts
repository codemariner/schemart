import { Command, flags as Flags } from '@oclif/command';
import Parser from '@oclif/parser';
import { Boolean, Partial, Record, Static, String } from 'runtypes';

const CmdFlags = Record({
	'db-uri': String,
}).And(
	Partial({
		'dry-run': Boolean,
	})
);
type CmdFlags = Static<typeof CmdFlags>;

export default class SchemaRTCommand extends Command {
	static description = 'Generate Runtype and Typescript definitions of database schema.';

	static args: Parser.args.Input = [
		{
			name: 'dbUri',
			required: true,
			description: 'Database URI',
		},
	];

	static flags: Flags.Input<any> = {
		'dry-run': Flags.boolean({
			char: 'd',
			description: "Perform all operations but don't actually generate output",
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
		console.log(cmdFlags);
	}
}
