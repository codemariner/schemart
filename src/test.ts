// generated from schemart

import * as rt from 'runtypes';

export const GenderEnum = rt.Union(rt.Literal('male'), rt.Literal('female'));
export type Gender = 'male' | 'female';

export const Users = rt.Record({
	id: rt.Number,
	name: rt.String,
	email: rt.String,
	emailValidated: rt.Optional(rt.Boolean.Or(rt.Null)),
	availability: rt.Optional(rt.Unknown.Or(rt.Null)),
	birthDay: rt.Optional(rt.String.Or(rt.Null)),
	gender: rt.Optional(GenderEnum.Or(rt.Null)),
	metadata: rt.Optional(rt.Unknown.Or(rt.Null)),
	createAt: rt.String,
	updatedAt: rt.String,
});
export type Users = rt.Static<typeof Users>;
