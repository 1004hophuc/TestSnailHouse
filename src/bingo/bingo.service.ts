import { SignDto } from './dto/sign.dto';
import { BingoTransaction, BingoTransactionStatus, BingoTransactionType } from './entities/bingo-transaction.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBingoDto } from './dto/create-bingo.dto';
import { UpdateBingoDto } from './dto/update-bingo.dto';
import { Bingo } from './entities/bingo.entity';
import { getWeb3 } from 'src/utils/web3';
import { Abi as SwapAbi } from 'src/contract/SwapPoint';

const SWAP_ADDRESS = '0x1235A5258a102370a94da85614f0f5dD85263971'
@Injectable()
export class BingoService {
  constructor(
    @InjectRepository(Bingo)
    private bingoRepository: Repository<Bingo>,

    @InjectRepository(BingoTransaction)
    private bingoTransactionRepository: Repository<BingoTransaction>

  ) { }

  async createDeposit(createBingoDto: CreateBingoDto) {
    const old = await this.bingoTransactionRepository.findOne({
      where: {
        txHash: createBingoDto.txHash,
      },
    });

    if (old) return old

    const saveItem = this.bingoTransactionRepository.create(createBingoDto);
    saveItem.status = BingoTransactionStatus.PENDING;
    saveItem.type = BingoTransactionType.DEPOSIT;
    await this.bingoTransactionRepository.save(saveItem);

    return saveItem;
  }

  async completeDeposit(createBingoDto: CreateBingoDto) {
    const user = await this.findOne(createBingoDto.address)

    const existTransaction = await this.bingoTransactionRepository.findOne({
      where: {
        txHash: createBingoDto.txHash,
      },
    });

    if (existTransaction) {
      if (existTransaction.status == BingoTransactionStatus.SUCCESS) {
        return existTransaction // No thing to update
      }
      else {
        existTransaction.status = BingoTransactionStatus.SUCCESS
        await this.bingoTransactionRepository.save(existTransaction);

        user.point += existTransaction.amount;
        await this.bingoRepository.save(user);

        return existTransaction
      }
    }

    const saveItem = this.bingoTransactionRepository.create(createBingoDto);
    saveItem.status = BingoTransactionStatus.SUCCESS;
    saveItem.type = BingoTransactionType.DEPOSIT;
    await this.bingoTransactionRepository.save(saveItem);

    user.point += saveItem.amount;
    await this.bingoRepository.save(user);

    return saveItem;
  }

  async createWithdraw(createBingoDto: CreateBingoDto) {
    const old = await this.bingoTransactionRepository.findOne({
      where: {
        txHash: createBingoDto.txHash,
      },
    });

    if (old) return old

    const saveItem = this.bingoTransactionRepository.create(createBingoDto);
    saveItem.status = BingoTransactionStatus.PENDING;
    saveItem.type = BingoTransactionType.WITHDRAW;
    await this.bingoTransactionRepository.save(saveItem);

    return saveItem;
  }

  async signWithdraw(signData: SignDto) {
    const { address, amount } = signData;

    try {
      const web3 = getWeb3();
      const user = await this.findOne(address);
      if (!user) return {
        code: 400,
        message: 'User not found'
      };

      if (amount > user.point) {
        return {
          code: 400,
          message: 'Not enough point'
        };
      }

      const PRIVATE_KEY = process.env.KEY_ADMIN;

      const swapContract = new web3.eth.Contract(
        SwapAbi as any,
        SWAP_ADDRESS
      );

      const nonce = await swapContract.methods.nonce().call();
      const amountInWei = web3.utils.toWei(amount + '');

      const hash = web3.utils.keccak256(
        web3.eth.abi.encodeParameters(
          ['uint256', 'address', 'uint256'],
          [
            amountInWei,
            address.toLowerCase(),
            nonce,
          ]
        )
      )
      const signature = web3.eth.accounts.sign(hash, PRIVATE_KEY);
      return {
        signature,
        amount: amountInWei,
        address
      };
    } catch (error) {
      console.log('error:', error)
      return {
        error: 400,
        message: "Some thing error"
      }
    }
  }

  async completeWithdraw(createBingoDto: CreateBingoDto) {
    const user = await this.findOne(createBingoDto.address)

    const old = await this.bingoTransactionRepository.findOne({
      where: {
        txHash: createBingoDto.txHash,
      },
    });

    if (old) {
      if (old.status == BingoTransactionStatus.SUCCESS) {
        return old // No thing to update
      }
      else {
        old.status = BingoTransactionStatus.SUCCESS
        await this.bingoTransactionRepository.save(old);

        user.point -= createBingoDto.amount;
        await this.bingoRepository.save(user);

        return old
      }
    }

    const saveItem = this.bingoTransactionRepository.create(createBingoDto);
    saveItem.status = BingoTransactionStatus.SUCCESS;
    saveItem.type = BingoTransactionType.WITHDRAW;
    await this.bingoTransactionRepository.save(saveItem);

    user.point -= createBingoDto.amount;
    await this.bingoRepository.save(user);

    return saveItem;
  }

  async findOne(address: string) {
    const bingo = await this.bingoRepository.findOne({
      where: {
        address: address.toLowerCase(),
      },
    });

    if (!bingo) {
      const newItem = new Bingo();
      newItem.address = address.toLowerCase()
      newItem.point = 1000;
      const saveItem = this.bingoRepository.create(newItem);
      await this.bingoRepository.save(saveItem);
      return saveItem;
    }

    return bingo;
  }

  update(id: number, updateBingoDto: UpdateBingoDto) {
    return `This action updates a #${id} bingo`;
  }

  remove(id: number) {
    return `This action removes a #${id} bingo`;
  }
}
