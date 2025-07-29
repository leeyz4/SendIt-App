import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsString,
  Matches,
  IsOptional,
  Validate,
} from 'class-validator';
import { Match } from '../decorators/match.decorator';

export class RegisterDto {
  @IsNotEmpty({ message: 'Name is required' })
  @IsString({ message: 'Name must be a string' })
  @MinLength(3, { message: 'Name must be at least 3 characters long' })
  name: string;

  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(5, { message: 'Password must be at least 5 characters long' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]+$/, {
    message: 'Password must contain both letters and numbers',
  })
  password: string;

  @IsNotEmpty({ message: 'Confirm password is required' })
  @MinLength(5, { message: 'Confirm password must be at least 5 characters long' })
  @Match('password', { message: 'Passwords do not match' })
  confirmPassword: string;

  @IsOptional()
  @IsString({ message: 'Phone must be a string' })
  phone?: string;

  @IsOptional()
  @IsString({ message: 'Role must be a string' })
  role?: string;
}
