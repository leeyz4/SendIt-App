import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
  IsEnum,
  IsPhoneNumber,
  IsUrl,
  Matches,
} from 'class-validator';
import { UserRole } from 'generated/prisma';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Name is required' })
  @IsString({ message: 'Name must be a string' })
  @MinLength(6, { message: 'Name must be atlest 6 characters long' })
  name: string;

  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be atleast 6 characters long' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]+$/, {
    message: 'Password must contain both letters and numbers',
  })
  password: string;

  @MinLength(6, {})
  confirmPassword: string;

  @IsOptional()
  @IsString({ message: 'Phone must be a string' })
  @IsPhoneNumber(undefined, { message: 'Please provide a valid phone number' })
  phone?: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @IsOptional()
  @IsUrl({}, { message: 'Profile image must be a valid URL' })
  profilePicture?: string;
}
