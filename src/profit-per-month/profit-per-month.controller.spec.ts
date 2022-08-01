import { Test, TestingModule } from '@nestjs/testing';
import { ProfitPerMonthController } from './profit-per-month.controller';
import { ProfitPerMonthService } from './profit-per-month.service';

describe('ProfitPerMonthController', () => {
  let controller: ProfitPerMonthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfitPerMonthController],
      providers: [ProfitPerMonthService],
    }).compile();

    controller = module.get<ProfitPerMonthController>(ProfitPerMonthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
