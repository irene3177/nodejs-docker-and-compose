import { Transform } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateOfferDto {
  @Transform(({ value }) => parseFloat(value), { toClassOnly: true })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(1)
  amount: number;

  @IsOptional()
  hidden?: boolean;

  @IsInt()
  itemId: number;
}
