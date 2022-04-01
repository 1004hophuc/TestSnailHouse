import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/user.entity';
import { Transaction } from './transactions/transactions.entity';

import { Connection } from 'typeorm';
import { TransactionsController } from './transactions/transactions.controller';
import { TransactionsModule } from './transactions/transactions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.development.env', '.env'],
      // load: [configuration],
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mongodb',
      url: process.env.MONGO_URI,
      database: process.env.MONGO_DB,
      //process.env.MONGO_DB,
      entities: [User, Transaction],
      username: process.env.MONGO_USERNAME,
      password: process.env.MONGO_PASSWORD,
      // ssl: true,
      // useUnifiedTopology: true,
      // useNewUrlParser: true,
      autoLoadEntities: true,
    }),
    UsersModule,
    TransactionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor(private connection: Connection) {
    console.log('\n\n\n\n\nxasasas');
    console.log('process.env.MONGO_DB: ', process.env.MONGO_DB);

    console.log('process.env.MONGO_USERNAME: ', process.env.MONGO_USERNAME);
    console.log('process.env.MONGO_PASSWORD: ', process.env.MONGO_PASSWORD);
  }
}
