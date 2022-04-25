import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Winery...';
  }

  getUser(): string {
    return 'Hello World!';
  }
}
