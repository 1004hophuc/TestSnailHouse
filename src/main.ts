import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { urlencoded, json } from 'express';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule, {
      cors: true,
    });
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    app.setGlobalPrefix('api');
    app.use(json({ limit: '50mb' }));
    app.use(urlencoded({ extended: true, limit: '50mb' }));
    await app.listen(4001);
    console.log('App is listened on : 4001');
  } catch (e) {
    console.log(e);
  }
}
bootstrap();
