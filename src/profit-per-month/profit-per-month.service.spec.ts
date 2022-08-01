import { Test, TestingModule } from '@nestjs/testing';
import { ProfitPerMonthService } from './profit-per-month.service';

describe('ProfitPerMonthService', () => {
  let service: ProfitPerMonthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProfitPerMonthService],
    }).compile();

    service = module.get<ProfitPerMonthService>(ProfitPerMonthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
