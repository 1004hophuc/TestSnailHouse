import {
    IsNumber,
    IsNotEmpty,
    IsString,
} from 'class-validator';

export class CreateBingoDto {

    @IsNotEmpty()
    @IsString()
    txHash: string;

    @IsNotEmpty()
    @IsString()
    address: string;

    @IsNumber()
    amount: number;

}
