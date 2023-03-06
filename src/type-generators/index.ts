import { Config } from '../config';

import generateTypescript from './typescript';
import generateRuntypes from './runtypes';
import { GenerateOpts, GeneratorFn } from './types';

const generators: { [key in Config['runtimeType']]: GeneratorFn } = {
	runtypes: generateRuntypes,
	typescript: generateTypescript,
};

export default function generate(opts: GenerateOpts): string {
	const {
		config: { runtimeType },
	} = opts;
	return generators[runtimeType](opts);
}
