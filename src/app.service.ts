import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello guys, wana hack my site ???';
  }

  getUser(): string {
    return 'Hello World!';
  }
}
