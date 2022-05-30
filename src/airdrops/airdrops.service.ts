import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getWeb3 } from 'src/utils/web3';
import { Repository } from 'typeorm';
import { AirdropType, CreateAirdropDto } from './dto/create-airdrop.dto';
import { UpdateAirdropDto } from './dto/update-airdrop.dto';
import { Airdrop } from './entities/airdrop.entity';
import { Abi as AirdropABI } from 'src/contract/Airdrop';
import { getCurrentTime } from 'src/utils';
import { TransactionsService } from 'src/transactions/transactions.service';
import Web3 from 'web3';
import { Abi as NFTAbi } from 'src/contract/NFT';

@Injectable()
export class AirdropsService {
  constructor(
    @InjectRepository(Airdrop) private airdropRepo: Repository<Airdrop>,
    private transactionService: TransactionsService
  ) {}

  async isNotDaoMember(user: string): Promise<boolean> {
    const isAddress = Web3.utils.isAddress(user);
    if (!isAddress) return true;

    // Check if user has bought NFT
    const hasBought = await this.transactionService.getOne(user);

    if (!hasBought) return true;
    const web3 = getWeb3();

    const StakingNFTContract = new web3.eth.Contract(
      NFTAbi as any,
      process.env.CONTRACT_NFT
    );

    // Check if this user has staked NFT.
    const tokenId = await StakingNFTContract.methods
      .tokenOfOwnerByIndex(user, 0)
      .call();
    if (!tokenId) return true;

    const info = await StakingNFTContract.methods.getToken(tokenId).call();

    return !info.stakeFreeze;
  }

  async create(createAirdropDto: CreateAirdropDto) {
    const existAirdrop = await this.airdropRepo.findOne(createAirdropDto);
    if (existAirdrop) {
      return {
        statusCode: 409,
        message: 'Airdrop is already exist!',
      };
    }
    const airdropCreate = this.airdropRepo.create(createAirdropDto);
    const airdropSave = await this.airdropRepo.save(airdropCreate);
    return airdropSave;
  }

  async findAll() {
    const airdrops = await this.airdropRepo.find();
    return airdrops;
  }

  async signAirdropMessage({ airdropId, user, tokenAddress, amount }) {
    try {
      const web3 = getWeb3();
      const airdrop = await this.findOne(airdropId);
      if (getCurrentTime() > airdrop.dateEnd) return;
      if (airdrop.dateStart > getCurrentTime()) return;

      // Check If this user has not been a dao member yet
      const isNotDAO = await this.isNotDaoMember(user.toLowerCase());
      if (isNotDAO) return;

      if (!web3.utils.isAddress(tokenAddress)) return;

      const PRIVATE_KEY = process.env.KEY_ADMIN;
      const CONTRACT_AIRDROP = process.env.CONTRACT_AIRDROP;

      const contract = new web3.eth.Contract(
        AirdropABI as any,
        CONTRACT_AIRDROP
      );

      const nonce = await contract.methods.nonce().call();
      const amountInWei = web3.utils.toWei(amount + '');
      const hash = web3.utils.keccak256(
        web3.eth.abi.encodeParameters(
          ['string', 'address', 'uint256', 'address', 'uint256'],
          [
            airdropId,
            tokenAddress,
            web3.utils.toWei(`${amount}`),
            user.toLowerCase(),
            nonce,
          ]
        )
      );

      const signature = web3.eth.accounts.sign(hash, PRIVATE_KEY);

      return {
        message: signature,
        amount: amountInWei,
        user,
        airdropId,
        tokenAddress,
      };
    } catch (e) {
      console.log('createHistory: ', e);
    }

    return false;
  }

  public async getPaginateAirdrops(page: number, limit: number) {
    try {
      // // Check If this user has not been a dao member yet
      // const isNotDAO = await this.isNotDaoMember(user);
      // if (isNotDAO) return;

      const [data, total] = await this.airdropRepo.findAndCount({
        order: {
          dateStart: 'ASC',
        },
        skip: (page - 1) * limit,
        take: limit,
      });
      return { data, total };
    } catch (error) {
      return error;
    }
  }

  public async getAirdropsByType(
    page: number,
    limit: number,
    type: AirdropType,
    user: string
  ) {
    // Check If this user has not been a dao member yet
    const isNotDAO = await this.isNotDaoMember(user);
    if (isNotDAO) return;
    let where = {};

    if (type !== AirdropType.ALL) {
      where = {
        type,
      };
    }

    const [data, total] = await this.airdropRepo.findAndCount({
      order: {
        dateStart: 'ASC',
      },
      skip: (page - 1) * limit,
      take: limit,
      where,
    });
    return { data, total };
  }

  public async getQuantityAirdropType(user: string) {
    // Check If this user has not been a dao member yet
    const isNotDAO = await this.isNotDaoMember(user);
    if (isNotDAO) return;

    const [all, social, airdrop, nft, completetask, p2e, random, registration] =
      await Promise.all([
        this.getPaginateAirdrops(1, 1),
        this.getAirdropsByType(1, 1, AirdropType.SOCIALNETWORK, user),
        this.getAirdropsByType(1, 1, AirdropType.AIRDROP, user),
        this.getAirdropsByType(1, 1, AirdropType.NFT, user),
        this.getAirdropsByType(1, 1, AirdropType.COMPLETETASK, user),
        this.getAirdropsByType(1, 1, AirdropType.P2E, user),
        this.getAirdropsByType(1, 1, AirdropType.RANDOM, user),
        this.getAirdropsByType(1, 1, AirdropType.REGISTRATION, user),
      ]);

    return {
      all: all.total,
      social: social.total,
      airdrop: airdrop.total,
      nft: nft.total,
      completetask: completetask.total,
      p2e: p2e.total,
      random: random.total,
      registration: registration.total,
    };
  }

  async findOne(id: string) {
    const airdrop = await this.airdropRepo.findOne(id);
    return airdrop;
  }

  async update(id: string, updateAirdropDto: UpdateAirdropDto) {
    await this.airdropRepo.update(id, updateAirdropDto);
    return {
      statusCode: 203,
      message: 'Item update successfully',
    };
  }

  async remove(id: string) {
    await this.airdropRepo.delete(id);
  }
}
