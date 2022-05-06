export const HISTORY_TYPE = {
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed',
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
