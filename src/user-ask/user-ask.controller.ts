import { Controller } from '@nestjs/common';

import { UserAskService } from './user-ask.service';

@Controller('user-ask')
export class UserAskController {
  constructor(private readonly userAskService: UserAskService) {}
}
