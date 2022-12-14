import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import abiDecoder from 'abi-decoder';
import axios from 'axios';
import { Abi as RewardsABI } from 'src/contract/Rewards';
import { PROFIT_TYPE } from 'src/profit/entities/profit.entity';
import { ProfitService } from 'src/profit/profit.service';
import { TransactionsService } from 'src/transactions/transactions.service';
import { fromWei, getWeb3, toWei } from 'src/utils/web3';
import { Repository } from 'typeorm';
import Web3 from 'web3';
import {
  CreateProfitWithdrawerDto,
  WithdrawStatus,
} from './dto/create-profit-withdrawer.dto';
import { UpdateProfitWithdrawerDto } from './dto/update-profit-withdrawer.dto';
import { ProfitWithdrawer } from './entities/profit-withdrawer.entity';

abiDecoder.addABI(RewardsABI);

@Injectable()
export class ProfitWithdrawerService {
  constructor(
    @InjectRepository(ProfitWithdrawer)
    private profitWithdrawerRepo: Repository<ProfitWithdrawer>,
    @Inject(forwardRef(() => ProfitService))
    private readonly profitService: ProfitService,
    private readonly transactionService: TransactionsService
  ) {}

  //
  async create(createProfitWithdrawerDto: CreateProfitWithdrawerDto) {
    const { account, type } = createProfitWithdrawerDto;

    // stop create new item if user has any pending txHash
    const isUserPending = await this.isUserPendingWithdraw(account, type);
    if (isUserPending) return false;

    // create new transaction with pending status
    createProfitWithdrawerDto.status = WithdrawStatus.PENDING;
    const profitWithdrawCreate = this.profitWithdrawerRepo.create(
      createProfitWithdrawerDto
    );
    const profitWithdrawSave = await this.profitWithdrawerRepo.save(
      profitWithdrawCreate
    );

    //update profit User Withdraw status
    // this.profitService.updateUserWithdraw(account, type);
    return profitWithdrawSave;
  }

  async fetchWithdrawer() {
    const withDrawTransactions = await axios.get(process.env.DOMAIN_BSC, {
      params: {
        address: process.env.CONTRACT_REWARDS,
        apikey: process.env.BSC_API_KEY,
        action: 'txlist',
        module: 'account',
        sort: 'desc',
        startblock: 0,
      },
    });

    const filterWithdraw = withDrawTransactions.data.result.filter(
      (transaction) =>
        transaction.functionName.includes('transferPermit') &&
        transaction.isError == 0
    );

    for (let i = 0; i < filterWithdraw.length; i++) {
      const transaction = filterWithdraw[i];

      const existWithdraw = await this.profitWithdrawerRepo.findOne({
        txHash: transaction.hash,
      });

      if (!existWithdraw) {
        const { params } = abiDecoder.decodeMethod(transaction.input);
        const amountWei = params[0].value;
        await this.create({
          account: transaction.from,
          amountWithdraw: +fromWei(amountWei),
          amountWeiWithdraw: amountWei,
          dateWithdraw: transaction.timeStamp,
          type: PROFIT_TYPE.IDO,
          txHash: transaction.hash,
          status: WithdrawStatus.PENDING,
        });
      }

      await this.profitWithdrawerRepo.update(
        { txHash: transaction.hash },
        { status: WithdrawStatus.FINISH }
      );
    }

    return withDrawTransactions.data;
  }

  async updateWithdrawStatus(updateStatusDto: UpdateProfitWithdrawerDto) {
    const { account, type, txHash } = updateStatusDto;
    const updateUser = await this.profitWithdrawerRepo.findOne({
      where: {
        account,
        type,
        txHash,
      },
    });

    updateUser.status = WithdrawStatus.FINISH;
    delete updateUser.id;
    const userFinishWithdraw = await this.profitWithdrawerRepo.update(
      { txHash },
      updateUser
    );
    return userFinishWithdraw;
  }

  async isUserPendingWithdraw(
    account: string,
    type: PROFIT_TYPE
  ): Promise<ProfitWithdrawer> {
    const userPending = await this.profitWithdrawerRepo.findOne({
      where: {
        account,
        type,
        status: WithdrawStatus.PENDING,
      },
    });
    return userPending;
  }

  async isDaoMember(user: string): Promise<boolean> {
    // DAO member is member that has bought and staked the NFT.
    const isAddress = Web3.utils.isAddress(user);
    if (!isAddress) return false;

    // Check if user has in the transaction list & staked the NFT
    const userInfo = await this.transactionService.getOne(user);
    return userInfo && userInfo?.isStaked;
  }

  async signWithdrawMessage({ user, type }) {
    try {
      const web3 = getWeb3();

      // Check If this user is not a dao member
      const isDao = await this.isDaoMember(user);
      if (!isDao) return false;

      // If there is one pending status, stop signing.
      const isPending = await this.isUserPendingWithdraw(user, type);
      if (isPending) return false;

      const PRIVATE_KEY = process.env.PROFIT_KEY_ADMIN;
      const CONTRACT_REWARDS = process.env.CONTRACT_REWARDS;

      const contract = new web3.eth.Contract(
        RewardsABI as any,
        CONTRACT_REWARDS
      );

      const totalAvailableWithdraw =
        await this.profitService.getTotalWithdrawAvailable(user, type);

      const nonce = await contract.methods.nonce().call();
      const amountInWei = toWei(totalAvailableWithdraw);

      const hash = web3.utils.keccak256(
        web3.eth.abi.encodeParameters(
          ['uint256', 'address', 'uint256'],
          [amountInWei, user, nonce]
        )
      );

      const signature = web3.eth.accounts.sign(hash, PRIVATE_KEY);

      return {
        message: signature,
        amount: amountInWei,
        user,
        type,
      };
    } catch (e) {
      console.log('createHistory: ', e);
    }

    return false;
  }

  async findAll(account: string, type: PROFIT_TYPE) {
    const transactions = this.profitWithdrawerRepo.find({
      where: { account, type, status: WithdrawStatus.FINISH },
    });
    return transactions;
  }

  findOne(id: number) {
    return `This action returns a #${id} profitWithdrawer`;
  }

  update(id: number, updateProfitWithdrawerDto: UpdateProfitWithdrawerDto) {
    return `This action updates a #${id} profitWithdrawer`;
  }

  remove(id: number) {
    return `This action removes a #${id} profitWithdrawer`;
  }
}
