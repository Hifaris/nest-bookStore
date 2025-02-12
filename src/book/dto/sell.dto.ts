import { IsNotEmpty, IsNumber } from 'class-validator';

export class SellBookDto {
  @IsNumber()
  @IsNotEmpty()
  quantity: number;
}
