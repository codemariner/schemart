import { Config } from '../config';

export type TsType = 'boolean' | 'string' | 'number' | 'unknown' | 'Date';

const runtypesMap: { [key in TsType]: string } = {
	boolean: 'rt.Boolean',
	Date: 'rt.Date',
	number: 'rt.Number',
	string: 'rt.String',
	unknown: 'rt.Unknown',
};

export function getType(runtimeType: Config['runtimeType'], tsType: TsType): string {
	if (runtimeType === 'typescript') {
		return tsType;
	}
	if (runtimeType === 'runtypes') {
		return runtypesMap[tsType];
	}
	throw new Error(`${runtimeType} is not supported`);
}
