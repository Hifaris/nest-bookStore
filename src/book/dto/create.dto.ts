import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsMongoId,
} from 'class-validator';

export class CreateBookDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  price: number;

  @IsMongoId()
  @IsNotEmpty()
  category: string; // รหัสหมวดหมู่ (ObjectId) ที่เชื่อมโยงกับ Category

  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;

  @IsNumber()
  @IsOptional()
  stock?: number = 0;
}

export class updateBookDto {
  @IsString()
  @IsOptional()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  price: number;

  @IsMongoId()
  @IsOptional()
  category: string; 

  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;

  @IsNumber()
  @IsOptional()
  stock?: number = 0;
}
