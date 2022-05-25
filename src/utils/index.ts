import moment from 'moment';

export const getCurrentTime = () => new Date().getTime();

export const profitDao = (
  reward: number,
  percent: number,
  members: number
): number => get12Decimals((reward * (percent / 100)) / members);

export const get12Decimals = (number: number): number =>
  Math.floor(number * 1e12) / 1e12;

export const getCurrentStartOfDate = () =>
  new Date(new Date().setHours(0, 0, 0, 0)).getTime();

export const getCurrentHourDate = () => {
  const currentHours = new Date().getHours();
  const startOfDay = new Date(
    new Date().setHours(currentHours, 0, 0, 0)
  ).getTime();
  return startOfDay;
};
