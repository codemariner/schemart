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
	 * idx: PK__users__K1
	 */
	id: rt.Number,
	/**
	 * idx: UK__users__K2_k3
	 * idx: name_users_birth_day
	 */
	name: rt.String,
	/**
	 * idx: UK__users__K2_k3
	 */
	email: rt.String,
	emailValidated: rt.Optional(rt.Boolean.Or(rt.Null)),
	/**
	 * The range of time the user is considered available.
	 */
	availability: rt.Optional(IntervalRt.Or(rt.Null)),
	schedule: rt.Optional(rt.Array(IntervalRt).Or(rt.Null)),
	/**
	 * idx: users_birth_day
	 * idx: name_users_birth_day
	 */
	birthDay: rt.Optional(DateRt.Or(rt.Null)),
	gender: rt.Optional(GenderEnum.Or(rt.Null)),
	metadata: rt.Optional(rt.Unknown.Or(rt.Null)),
	createAt: rt.String,
	updatedAt: rt.String,
});
export type Users = rt.Static<typeof Users>;

export const BlogPosts = rt.Record({
	/**
	 * idx: PK__blog_posts__K1
	 */
	id: rt.Number,
	userId: rt.Number,
	/**
	 * idx: UK__blog_posts__K3
	 */
	subject: rt.String,
	content: rt.Optional(rt.String.Or(rt.Null)),
	createAt: rt.String,
	updatedAt: rt.String,
});
export type BlogPosts = rt.Static<typeof BlogPosts>;
