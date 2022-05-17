import { Module } from '@nestjs/common';
import { ProfitWithdrawerService } from './profit-withdrawer.service';
import { ProfitWithdrawerController } from './profit-withdrawer.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfitWithdrawer } from './entities/profit-withdrawer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProfitWithdrawer])],
  controllers: [ProfitWithdrawerController],
  providers: [ProfitWithdrawerService],
  exports: [ProfitWithdrawerService],
})
export class ProfitWithdrawerModule {}
