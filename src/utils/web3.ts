import configuration from '../config';
import Web3 from 'web3';

function getNodes(): string {
  return configuration()[process.env.CHAIN_ID ?? 97]?.appNodes;
}

function getRandomNode() {
  const BSC_NODE_RPC = getNodes();
  console.log(BSC_NODE_RPC);
  return BSC_NODE_RPC[Math.floor(Math.random() * BSC_NODE_RPC?.length)];
}

function getRandomWeb3() {
  const provider: string = getRandomNode();
  console.log('provider: ', provider);
  const newWeb3 = new Web3(provider);

  return newWeb3;
}

export const getWeb3 = () => {
  return getRandomWeb3();
};

// export const getContract = (abi: any, address: string) => {
//   const web3 = getRandomWeb3();
//   return new web3.eth.Contract(abi, address);
// };

// export const isTransactionMined = async (transactionHash) => {
//   try {
//     const txReceipt = await getWeb3().eth.getTransactionReceipt(
//       transactionHash,
//     );
//     if (txReceipt && txReceipt.blockNumber) {
//       return true;
//     }
//     return false;
//   } catch (e) {
//     return false;
//   }
// };

// export const getCurrentBlock = async () => {
//   return await getRandomWeb3().eth.getBlockNumber();
// };
