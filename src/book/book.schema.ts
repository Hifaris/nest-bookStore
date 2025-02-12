import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BookDocument = Book & Document;

@Schema({ timestamps: true })
export class Book {
  @Prop({ required: true })
  title: string;

  @Prop({ required: false })
  description?: string;

  @Prop({ required: true })
  price: number;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  category: Types.ObjectId;

  @Prop({ default: true })
  isActive?: boolean;

  @Prop({ default: 0 })
  stock?: number;

  @Prop({ default: 0 })
  sold?: number;
}

export const BookSchema = SchemaFactory.createForClass(Book);
