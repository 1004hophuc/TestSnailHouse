export const getCurrentTime = () => new Date().getTime();

export const profitDao = (
  reward: number,
  percent: number,
  members: number
): number => get12Decimals((reward * (percent / 100)) / members);

export const get12Decimals = (number: number): number =>
  Math.floor(number * 1e12) / 1e12;
