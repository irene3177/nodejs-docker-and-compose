import { IsEmail, IsNotEmpty, Length, MinLength } from 'class-validator';

export class SigninUserDto {
  @IsNotEmpty({ message: 'Username is required' })
  @Length(1, 64)
  username: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(2)
  password: string;
}
