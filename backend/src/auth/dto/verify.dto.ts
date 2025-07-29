import { IsEmail, IsNotEmpty } from 'class-validator';

export class VerifyCodeDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  code: string;
}
