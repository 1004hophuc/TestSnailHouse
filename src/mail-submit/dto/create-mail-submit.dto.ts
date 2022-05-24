import { IsNotEmpty, IsEmail } from 'class-validator';
export class CreateMailSubmitDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
