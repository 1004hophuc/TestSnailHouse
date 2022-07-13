import { Injectable } from '@nestjs/common';
import { CreateConfigurationDto } from './dto/create-configuration.dto';
import { UpdateConfigurationDto } from './dto/update-configuration.dto';
import { Configuration } from './entities/configuration.entity';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { getWeb3 } from 'src/utils/web3';
import NFTAbi from '../contract/NFT.json';
import MarketABI from '../contract/Market.json';
import Promise from 'bluebird';
import { getRndInteger } from 'src/utils';

@Injectable()
export class ConfigurationService {
  constructor(
    @InjectRepository(Configuration)
    private configurationRepository: Repository<Configuration>
  ) {}

  async create(createConfigurationDto: CreateConfigurationDto) {
    if (createConfigurationDto.key != process.env.KEY_INIT) {
      return false;
    }

    delete createConfigurationDto.key;

    const item = await this.configurationRepository.create(
      createConfigurationDto
    );
    const data = await this.configurationRepository.save(item);
    return data;
  }

  findAll() {
    return `This action returns all configuration`;
  }

  async findOne(name: string) {
    const data = await this.configurationRepository.findOne({ name });

    return data;
  }

  async update(name: string, value: string) {
    try {
      const e = await this.configurationRepository.findOne({
        name,
      });
      e.value = value;
      return await this.configurationRepository.save(e);
    } catch (e) {
      console.log('update configuration : ', e);
    }
  }

  async signedTransaction(
    mintAccount,
    contract,
    methodName,
    methodParams,
    contractAddress,
    privateKey
  ) {
    const web3 = getWeb3();

    const transaction = contract.methods[methodName](...methodParams);

    // const [gas, gasPrice] = await Promise.all([
    //  ,
    //   ,
    // ]);

    const options = {
      to: contractAddress,
      data: transaction.encodeABI(),
      gas: await transaction.estimateGas({ from: mintAccount.address }),
      gasPrice: await web3.eth.getGasPrice(),
    };

    const signed = await web3.eth.accounts.signTransaction(options, privateKey);

    const receipt = await web3.eth.sendSignedTransaction(signed.rawTransaction);

    return receipt;
  }

  async mintNft() {
    const web3 = getWeb3();
    const chainId = 56;

    const PRIVATE_KEY = {
      97: '4db267c508987d8f4043f461b377775be33a1e9f8e42a098b60227a16ebe1b6e',
      56: '4126a3afa1057d3ac25a0e74b2b049252a2d0eccbf2b204b331056732e2b15a8',
    };

    const NFTAddress = {
      97: '0x45F3Fb50a69B106ecC071e081fd07E39498A78Af',
      56: '0x67232767745EEE77b49a6040b723825C02e5cb8A',
    };

    const MarketAddress = {
      97: '0xF975cFF494eF91039E186c0a7017baD119B6cc92',
      56: '0xFedD560B9a7e703e9A18E3e1e6857C77EB88f1e8',
    };

    const CORKToken = {
      97: '0x51151b5C321c584d26C0DEeD57ee9de8e40A03A9',
      56: '0xe7EAdA32CAF827d3bA8Cb1074830d803C9bD48c3',
    };

    const mintAccount = web3.eth.accounts.privateKeyToAccount(
      PRIVATE_KEY[chainId]
    );
    const NFTContract = new web3.eth.Contract(
      NFTAbi as any,
      NFTAddress[chainId]
    );

    const MarketContract = new web3.eth.Contract(
      MarketABI as any,
      MarketAddress[chainId]
    );

    const Receipts = [];
    for (let i = 0; i < 1; i++) {
      // Mint NFT
      const mintNFTReceipt = await this.signedTransaction(
        mintAccount,
        NFTContract,
        'mint',
        [mintAccount.address],
        NFTAddress[chainId],
        PRIVATE_KEY[chainId]
      );

      const tokenId = web3.eth.abi.decodeParameter(
        'uint256',
        mintNFTReceipt.logs[0].topics[3]
      );
      console.log(`mint lần ${i + 1}, TokenId: ${tokenId}`);

      // Sell To Market

      const randomPrice = getRndInteger(200, 600);
      const offerTransactionReceipt = await this.signedTransaction(
        mintAccount,
        MarketContract,
        'offer',
        [
          0,
          CORKToken[chainId],
          NFTAddress[chainId],
          tokenId,
          web3.utils.toWei(randomPrice + ''),
        ],
        MarketAddress[chainId],
        PRIVATE_KEY[chainId]
      );

      console.log(
        `Market Offer lần ${i + 1}, Gía: ${randomPrice} CORK, hash: ${
          offerTransactionReceipt.transactionHash
        },`
      );

      Receipts.push(offerTransactionReceipt.transactionHash);
    }

    return Receipts;
  }

  remove(id: number) {
    return `This action removes a #${id} configuration`;
  }
}
