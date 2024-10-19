import { IsNotEmpty, Length } from 'class-validator';

export class FindUserDto {
  @IsNotEmpty()
  @Length(1, 64)
  query: string;
}
