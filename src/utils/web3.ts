import Common from '@ethereumjs/common';
import { Interface } from '@ethersproject/abi';
import BigNumber from 'bignumber.js';
import Web3 from 'web3';
import configuration from '../config';
import { MulticallAbi } from '../contract/Multicall';

const MULTICALL_ADDRESS = {
  56: '0x38ce767d81de3940CFa5020B55af1A400ED4F657',
  97: '0x67ADCB4dF3931b0C5Da724058ADC2174a9844412',
  137: '0x95028E5B8a734bb7E2071F96De89BABe75be9C8E',
};

function getNodes(): string {
  return configuration()[process.env.CHAIN_ID ?? 97]?.appNodes;
}

export function getRandomNode() {
  const BSC_NODE_RPC = getNodes();
  return BSC_NODE_RPC[Math.floor(Math.random() * BSC_NODE_RPC?.length)];
}

function getRandomWeb3() {
  const provider: string = getRandomNode();
  const newWeb3 = new Web3(provider);

  return newWeb3;
}

export const getWeb3 = () => {
  return getRandomWeb3();
};

export const getCustomNetwork = (chainId: number) => {
  const customNetwork = Common.forCustomChain('mainnet', {
    name: 'bnb',
    networkId: chainId,
    chainId,
  });

  return customNetwork;
};

export const toWei = (number: number): string => {
  try {
    return Web3.utils.toWei(new BigNumber(number).toString(), 'ether');
  } catch (e) {
    console.log('e:', e);
  }
};

export const fromWei = (number: number | string): string => {
  try {
    return Web3.utils.fromWei(number + '');
  } catch (e) {
    console.log('e:', e);
  }
};

export const isAddress = (address: string): boolean =>
  Web3.utils.isAddress(address);

export const getAddressFromSign = (messageHash: string, signature: string) => {
  const web3 = getWeb3();
  return web3.eth.accounts.recover(messageHash, signature);
};

export const toCheckSumAddress = (address: string): string =>
  Web3.utils.toChecksumAddress(address);

export const getMulticallContract = () => {
  const MulticallAddress = MULTICALL_ADDRESS[97];
  const web3 = getWeb3();
  return new web3.eth.Contract(MulticallAbi as any, MulticallAddress);
};

export const multicall = async (callAbi, calls) => {
  const itf = new Interface(callAbi);
  const multicallContract = getMulticallContract();
  const calldata = calls.map((call) => [
    call.address.toLowerCase(),
    itf.encodeFunctionData(call.name, call.params),
  ]);
  const data = await multicallContract.methods.aggregate(calldata).call();

  return data;
  // const res = returnData.map((call, i) =>
  //   itf.decodeFunctionResult(calls[i].name, call)
  // );

  // return res;
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
