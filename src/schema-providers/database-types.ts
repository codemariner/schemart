import { Literal, Static, Union } from 'runtypes';

export const DatabaseType = Union(Literal('postgres'));
export type DatabaseType = Static<typeof DatabaseType>;
