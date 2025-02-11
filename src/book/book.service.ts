import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Book, BookDocument } from './book.schema';
import { Model } from 'mongoose';
import { CreateBookDto } from './dto/create.dto';
import { CategoryService } from 'src/category/category.service';

@Injectable()
export class BookService {
  constructor(
    @InjectModel(Book.name) private bookModel: Model<BookDocument>,
    private readonly categoryService: CategoryService,
  ) {}

  async createBook(createBookDto: CreateBookDto): Promise<Book> {
    const category = await this.categoryService.getCategoryById(
      createBookDto.category,
    );
    if (!category) {
      throw new Error('Category not found');
    }

    const newBook = new this.bookModel(createBookDto);

    return newBook.save();
  }

  async getBooks(): Promise<Book[]> {
    return this.bookModel.find({ isActive: true }).exec();
  }

  async getBookById(id: string): Promise<Book | null> {
    const book = await this.bookModel.findById(id).exec();
    if (!book) {
      throw new Error('Book not found');
    }
    return book;
  }

  async updateBook(
    id: string,
    updateBookDto: CreateBookDto,
  ): Promise<Book | null | { message: string }> {
    const book = await this.bookModel
      .findByIdAndUpdate(id, updateBookDto, { new: true })
      .exec();
    if (!book) {
      throw new Error('Book not found');
    }
    return {
      message: 'Book updated successfully',
    };
  }

  async searchBooks(query: string): Promise<Book[]> {
    try {
      const results = await this.bookModel
        .aggregate([
          {
            $search: {
              index: 'bookSearched',
              text: {
                query,
                path: ['title', 'description'],
              },
            },
          },
        ])
        .exec();

      return results;
    } catch (error) {
      console.error('Search error:', error);
      throw new Error(`Search failed: ${error.message}`);
    }
  }
}
