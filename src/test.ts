/* eslint-disable import/no-extraneous-dependencies */
import { Interval } from 'luxon';

const start = new Date('2021-10-31 00:00:00');
const end = new Date('2021-11-01 00:00:00');
const i = Interval.fromDateTimes(start, end);
i.end.minus(1000);
console.log(i.end);
console.log(i instanceof Interval);
