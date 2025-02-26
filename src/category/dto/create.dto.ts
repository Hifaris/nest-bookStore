import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { Document, Types } from 'mongoose';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export interface CreateCategory extends Document {
  _id: Types.ObjectId;
  name: string;
  description: string;
  __v: number;
}
