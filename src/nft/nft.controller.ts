import { Controller, Param, Get, Body, Post, Query } from '@nestjs/common';

import { NftService } from './nft.service';

import { NftImageService } from './nft-image.service';

import { QueryNFTImageDto } from './dto/query-nft-image.dto';

@Controller('nft')
export class NftController {
  constructor(
    private readonly nftService: NftService,
    private readonly nftImageService: NftImageService
  ) {}

  @Get('/metadata/:id')
  public async getToken(@Param() params): Promise<any> {
    const data = await this.nftService.getMetadata(params.id);
    return data;
  }

  @Get('/images')
  public async getImages(@Query() params: QueryNFTImageDto): Promise<any> {
    return {
      status: 200,
      data: await this.nftImageService.getByLevel(params),
    };
  }
  @Get('/images/:id')
  public async getDetailImages(@Param() params): Promise<any> {
    return {
      status: 200,
      data: await this.nftImageService.getDetailImage(params.id),
    };
  }

  @Post('/image/init')
  public async initData(@Body() data: any): Promise<any> {
    return {
      status: 200,
      data: await this.nftImageService.initData(data.data, data.key),
    };
  }
}
