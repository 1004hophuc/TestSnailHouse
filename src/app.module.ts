import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/user.entity';
import { Transaction } from './transactions/transactions.entity';

import { Connection } from 'typeorm';
import { TransactionsModule } from './transactions/transactions.module';

import { NftModule } from './nft/nft.module';
import { HistoryModule } from './history/history.module';
import { RewardsModule } from './rewards/rewards.module';
import { ProfitWithdrawerModule } from './profit-withdrawer/profit-withdrawer.module';
import { ProfitModule } from './profit/profit.module';
import { AirdropsModule } from './airdrops/airdrops.module';
import { MailSubmitModule } from './mail-submit/mail-submit.module';
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
      // ssl: true,
      autoLoadEntities: true,
      logging: true,
    }),

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
