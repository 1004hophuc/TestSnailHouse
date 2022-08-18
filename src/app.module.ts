import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Transaction } from './transactions/transactions.entity';
import { User } from './users/user.entity';
import { UsersModule } from './users/users.module';

import { Connection } from 'typeorm';
import { TransactionsModule } from './transactions/transactions.module';

import { ScheduleModule } from '@nestjs/schedule';
import { AirdropsModule } from './airdrops/airdrops.module';
import { DaoElementTransactionModule } from './dao-element-transaction/dao-element-transaction.module';
import { HistoryModule } from './history/history.module';
import { IdoNftModule } from './ido-nft/ido-nft.module';
import { IdoTransactionModule } from './ido-transaction/ido-transaction.module';
import { MailSubmitModule } from './mail-submit/mail-submit.module';
import { NftModule } from './nft/nft.module';
import { ProfitMarketSentModule } from './profit-market-sent/profit-market-sent.module';
import { ProfitSentModule } from './profit-sent/profit-sent.module';
import { ProfitSwapSentModule } from './profit-swap-sent/profit-swap-sent.module';
import { ProfitWithdrawerModule } from './profit-withdrawer/profit-withdrawer.module';
import { ProfitModule } from './profit/profit.module';
import { RewardsModule } from './rewards/rewards.module';
import { StatisticModule } from './statistic/statistic.module';
import { VotingModule } from './voting/voting.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.development.env', '.env'],
      // load: [configuration],
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mongodb',
      host: process.env.MONGO_HOST,
      port: +process.env.MONGO_PORT,
      username: process.env.MONGO_USERNAME,
      password: process.env.MONGO_PASSWORD,
      database: process.env.MONGO_DB,
      // database: process.env.MONGO_DB,
      //process.env.MONGO_DB,
      entities: [User, Transaction],
      // synchronize: true,
      // ssl: true,
      // extra: { authSource: 'admin' },
      autoLoadEntities: true,
      logging: true,
    }),

    ScheduleModule.forRoot(),
    UsersModule,
    TransactionsModule,
    NftModule,
    HistoryModule,
    RewardsModule,
    ProfitWithdrawerModule,
    ProfitModule,
    AirdropsModule,
    MailSubmitModule,
    VotingModule,
    StatisticModule,
    DaoElementTransactionModule,
    IdoNftModule,
    IdoTransactionModule,
    ProfitSentModule,
    ProfitSwapSentModule,
    ProfitMarketSentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor(private connection: Connection) {
    console.log('process.env.MONGO_DB: ', process.env.MONGO_DB);

    console.log('process.env.MONGO_USERNAME: ', process.env.MONGO_USERNAME);
    console.log('process.env.MONGO_PASSWORD: ', process.env.MONGO_PASSWORD);
  }
}
