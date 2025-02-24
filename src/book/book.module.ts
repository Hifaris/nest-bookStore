import { Module } from '@nestjs/common';
import { BookService } from './book.service';
import { BookController } from './book.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Book, BookSchema } from './book.schema';
import { CategoryModule } from 'src/category/category.module';
import { BookRepository } from './book.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Book.name, schema: BookSchema }]),
    CategoryModule,
  ],
  providers: [BookService, BookRepository],
  controllers: [BookController],
})
export class BookModule {}
