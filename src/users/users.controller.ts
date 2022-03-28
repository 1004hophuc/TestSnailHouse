import {
  Controller,
  Query,
  Get,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import Web3 from 'web3';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}
  @Get()
  public async getRefCode(@Query('address') address: string): Promise<any> {
    const isValidAddress = Web3.utils.isAddress(address);
    if (!isValidAddress) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: 'Is not valid address',
        },
        500,
      );
    }
    return {
      status: 200,
      data: await this.userService.getRefCode({ address }),
    };
  }
}
