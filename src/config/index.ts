export const HISTORY_TYPE = {
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed',
};

export const CONFIG = {
  LAST_BLOCK: 'last_block',
};

export default () => ({
  mongo_uri: process.env.MONGO_URL,
  environment: process.env.NODE_ENV,
  chainId: process.env.CHAIN_ID || 97,
  97: {
    appNodes: [
      'https://bsc-testnet.nodereal.io/v1/29428fcbbb9d4e8eb33e3c98a9b9c9cc',
      'https://bsc-testnet.nodereal.io/v1/29428fcbbb9d4e8eb33e3c98a9b9c9cc',
      'https://bsc-testnet.nodereal.io/v1/29428fcbbb9d4e8eb33e3c98a9b9c9cc',
      // 'https://data-seed-prebsc-1-s1.binance.org:8545/',
      // 'https://data-seed-prebsc-2-s2.binance.org:8545/',
      // 'https://data-seed-prebsc-2-s1.binance.org:8545/',
    ],
  },
  56: {
    appNodes: [
      'https://bsc-dataseed.binance.org:443',
      'https://bsc-dataseed1.defibit.io:443',
      'https://bsc-dataseed1.ninicoin.io:443',
    ],
  },
});

export const getTime = (now: any) => {
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  return `${
    monthNames[now?.getMonth()]
  } ${now?.getDate()}, ${now?.getFullYear()}, ${now?.getHours()}:${
    now?.getMinutes() < 10 ? `0${now?.getMinutes()}` : now?.getMinutes()
  }`;
};

export const GET_AMOUNT_LAUNCHPAD = {
  0: 1000,
  1: 3000,
  2: 5000,
  3: 10000,
  4: 20000,
};
