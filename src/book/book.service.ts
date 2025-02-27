import { Injectable } from '@nestjs/common';
import { Book } from './book.schema';
import { Types } from 'mongoose';
import {
  BookWithCategory,
  CreateBookDto,
  updateBookDto,
} from './dto/create.dto';
import { CategoryService } from '../category/category.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { BookRepository } from './book.repository';

@Injectable()
export class BookService {
  constructor(
    private readonly bookRepository: BookRepository,
    private readonly categoryService: CategoryService,
  ) {}

  async createBook(createBookDto: CreateBookDto): Promise<Book> {
    const categoryId = new Types.ObjectId(createBookDto.category);
    const category = await this.categoryService.getCategoryById(
      categoryId.toString(),
    );
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return this.bookRepository.create({
      ...createBookDto,
      category: categoryId,
    });
  }
  //All books
  async getBooks(): Promise<Book[]> {
    return this.bookRepository.findAll();
  }
  //Get books by Id
  async getBookById(id: string): Promise<BookWithCategory> {
    const book = await this.bookRepository.findById(id);
    if (!book) {
      throw new NotFoundException('Book not found');
    }
    return book;
  }
  //Update book details
  async updateBook(
    id: string,
    updateBookDto: updateBookDto,
  ): Promise<{ message: string }> {
    // in case update stock
    if (updateBookDto.stock) {
      const updated = await this.bookRepository.updateStock(
        id,
        +updateBookDto.stock,
      );
      if (!updated) {
        throw new NotFoundException('Book not found');
      }
      return {
        message: 'Book updated successfully',
      };
    }
    //update other details
    const book = await this.bookRepository.updateById(id, updateBookDto);
    if (!book) {
      throw new NotFoundException('Book not found');
    }
    return {
      message: 'Book updated successfully',
    };
  }
  //search book
  async searchBooks(query: string): Promise<BookWithCategory[]> {
    try {
      const results = await this.bookRepository.search(query);

      if (results.length === 0) {
        throw new NotFoundException(
          'No books found matching with your searching',
        );
      }

      return results;
    } catch (error: unknown) {
      console.error('Search error:', error);
      if (error instanceof Error) {
        throw new NotFoundException(`${error.message}`);
      }
      throw new NotFoundException('An error occurred during search');
    }
  }

  async sellBook(id: string, quantity: number): Promise<string> {
    const book = await this.bookRepository.findBookById(id);
    if (!book) {
      throw new NotFoundException('Book not found');
    }

    if (!book.isActive) {
      throw new BadRequestException('Book is not active');
    }

    // Convert stored values to numbers and validate
    const currentStock = Number(book.stock);
    if (isNaN(currentStock) || currentStock <= 0) {
      throw new BadRequestException('Book is out of stock');
    }

    if (currentStock < quantity) {
      throw new BadRequestException('Not enough books in stock');
    }
    // update sales
    const updatedBook = await this.bookRepository.updateSales(id, quantity);

    if (!updatedBook) {
      throw new Error('Failed to update book');
    }

    return 'sold successfully';
  }
  //Top-selling books
  async getTopSellingBooks(): Promise<Book[]> {
    return this.bookRepository.findTopSelling();
  }
}
