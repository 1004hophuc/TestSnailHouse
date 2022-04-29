export default () => ({
  mongo_uri: process.env.MONGO_URL,
  environment: process.env.NODE_ENV,
  chainId: process.env.CHAIN_ID || 97,
  97: {
    appNodes: [
      'https://data-seed-prebsc-1-s1.binance.org:8545/',
      'https://data-seed-prebsc-2-s2.binance.org:8545/',
      'https://data-seed-prebsc-2-s1.binance.org:8545/',
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
