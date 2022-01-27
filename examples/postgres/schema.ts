// generated from schemart
import * as rt from 'runtypes';

// eslint-disable-next-line import/no-extraneous-dependencies
import { Interval } from 'luxon';

function isInterval(value: unknown): value is Interval {
	return value instanceof Interval;
}
function isDate(value: unknown): value is Date {
	return value instanceof Date;
}

const IntervalRt = rt.Unknown.withGuard(isInterval);
const DateRt = rt.Unknown.withGuard(isDate);

export const GenderEnum = rt.Union(rt.Literal('male'), rt.Literal('female'));
export type Gender = rt.Static<typeof GenderEnum>;

/**
 * A customer user account.
 */
export const Users = rt.Record({
	/**
	 * type: int4
	 * idx: PK__users__K1
	 */
	id: rt.Number,
	/**
	 * type: text
	 * idx: UK__users__K2_k3
	 */
	name: rt.String,
	/**
	 * type: text
	 * idx: UK__users__K2_k3
	 */
	email: rt.String,
	/**
	 * type: bool
	 */
	emailValidated: rt.Optional(rt.Boolean.Or(rt.Null)),
	/**
	 * The range of time the user is considered available.
	 * type: tsrange
	 */
	availability: rt.Optional(IntervalRt.Or(rt.Null)),
	/**
	 * type: _tsrange
	 */
	schedule: rt.Optional(rt.Array(IntervalRt).Or(rt.Null)),
	/**
	 * type: date
	 */
	birthDay: rt.Optional(DateRt.Or(rt.Null)),
	/**
	 * type: gender
	 */
	gender: rt.Optional(GenderEnum.Or(rt.Null)),
	/**
	 * type: json
	 */
	metadata: rt.Optional(rt.Unknown.Or(rt.Null)),
	/**
	 * type: timestamptz
	 */
	createAt: rt.String,
	/**
	 * type: timestamptz
	 */
	updatedAt: rt.String,
});
export type Users = rt.Static<typeof Users>;

export const BlogPosts = rt.Record({
	/**
	 * type: int4
	 * idx: PK__blog_posts__K1
	 */
	id: rt.Number,
	/**
	 * type: int4
	 */
	userId: rt.Number,
	/**
	 * type: varchar
	 * idx: UK__blog_posts__K3
	 */
	subject: rt.String,
	/**
	 * type: text
	 */
	content: rt.Optional(rt.String.Or(rt.Null)),
	/**
	 * type: timestamptz
	 */
	createAt: rt.String,
	/**
	 * type: timestamptz
	 */
	updatedAt: rt.String,
});
export type BlogPosts = rt.Static<typeof BlogPosts>;
