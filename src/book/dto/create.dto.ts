import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsMongoId,
} from 'class-validator';
import { Types } from 'mongoose';

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
  category: string; //(ObjectId) ที่เชื่อมโยงกับ Category

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
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsMongoId()
  @IsOptional()
  category?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;

  @IsNumber()
  @IsOptional()
  stock?: number = 0;
}

export interface BookWithCategory {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  price: number;
  stock?: number;
  category: { name: string };
}

export interface BookDocument {
  _id: Types.ObjectId;
  title: string;
  description: string;
  price: number;
  category: string | Types.ObjectId;
  isActive: boolean;
  stock: number;
  sold: number;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}
