import { Literal, Static, Union } from 'runtypes';

export const DatabaseType = Union(Literal('postgres'), Literal('mysql'));
export type DatabaseType = Static<typeof DatabaseType>;
