import { Module } from '@nestjs/common';
import { BingoService } from './bingo.service';
import { BingoController } from './bingo.controller';
import { Bingo } from './entities/bingo.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BingoTransaction } from './entities/bingo-transaction.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Bingo, BingoTransaction]),
  ],
  controllers: [BingoController],
  providers: [BingoService]
})
export class BingoModule { }
