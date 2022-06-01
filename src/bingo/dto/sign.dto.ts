import {
    IsNumber,
    IsNotEmpty,
    IsString,
} from 'class-validator';

export class SignDto {


    @IsNotEmpty()
    @IsString()
    address: string;

    @IsNumber()
    amount: number;

}
