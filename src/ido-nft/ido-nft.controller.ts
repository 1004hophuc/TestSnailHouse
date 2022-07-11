import { Controller, Param, Get, Body, Post, Query } from '@nestjs/common';

import { idoNFTService } from './ido-nft.service';

import { idoNFTImageService } from './ido-nft-image.service';

import { QueryIDONFTImageDto } from './dto/query-nft-image.dto';

@Controller('ido-nft')
export class idoNFTController {
  constructor(
    private readonly idoNFTService: idoNFTService,
    private readonly idoNFTImageService: idoNFTImageService
  ) {}

  @Get('/metadata/:id')
  public async getToken(@Param() params): Promise<any> {
    const data = await this.idoNFTService.getMetadata(params.id);
    return data;
  }

  @Get('/images')
  public async getImages(@Query() params: QueryIDONFTImageDto): Promise<any> {
    return {
      status: 200,
      data: await this.idoNFTImageService.getByLevel(params),
    };
  }
  @Get('/images/:id')
  public async getDetailImages(@Param() params): Promise<any> {
    return {
      status: 200,
      data: await this.idoNFTImageService.getDetailImage(params.id),
    };
  }

  @Post('/image/init')
  public async initData(@Body() data: any): Promise<any> {
    return {
      status: 200,
      data: await this.idoNFTImageService.initData(data.data, data.key),
    };
  }
}
