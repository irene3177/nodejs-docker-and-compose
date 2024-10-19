import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  Length,
} from 'class-validator';

export class CreateWishlistDto {
  @IsNotEmpty()
  @Length(1, 250)
  name: string;

  @IsOptional()
  @Length(0, 1500)
  description?: string;

  @IsNotEmpty()
  @IsUrl()
  image: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  itemsId: number[];
}
