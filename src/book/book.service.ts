import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Book, BookDocument } from './book.schema';
import mongoose, { Model, Types } from 'mongoose';
import { CreateBookDto, updateBookDto } from './dto/create.dto';
import { CategoryService } from 'src/category/category.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

@Injectable()
export class BookService {
  constructor(
    @InjectModel(Book.name) private bookModel: Model<BookDocument>,
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

    const newBook = new this.bookModel({
      ...createBookDto,
      category: categoryId,
    });
    return newBook.save();
  }

  async getBooks(): Promise<Book[]> {
    return this.bookModel.find({ isActive: true }).exec();
  }

  async getBookById(id: string): Promise<Book | null> {
  
    const book = await this.bookModel.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(id) }, // ใช้ $match เพื่อค้นหาหนังสือที่ตรงกับ id
      },
      {
        $lookup: {
          from: 'categories', // ชื่อของ collection ที่ต้องการ join
          localField: 'category', // field ใน collection book ที่จะ join
          foreignField: '_id',
          as: 'category',
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          price: 1,
          stock: 1,
          category: { name: 1 },
        },
      },
    ]);

    if (book.length === 0) {
      throw new NotFoundException('Book not found');
    }
    // aggregate return aa array of object
    return book[0];
  }

  async updateBook(
    id: string,
    updateBookDto: updateBookDto,
  ): Promise<Book | null | { message: string }> {
    if (updateBookDto.stock) {
      const updatedStock = await this.bookModel.findByIdAndUpdate(
        id,
        {
          $inc: {
            stock: +updateBookDto.stock,
          },
        },
        { new: true, runValidators: true },
      );
      return {
        message: 'Book updated successfully',
      };
    }
    const book = await this.bookModel
      .findByIdAndUpdate(id, updateBookDto, { new: true })
      .exec();
    if (!book) {
      throw new NotFoundException('Book not found');
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
              index: "bookSearch",
              compound: {
                should: [
                  {
                    wildcard: {
                      query: query + "*",
                      path: "title",
                      allowAnalyzedField: true
                    }
                  },
                  {
                    wildcard: {
                      query: query + "*",
                      path: "description",
                      allowAnalyzedField: true
                    }
                  }
                ]
              }
            }
          },
          {
            $lookup: {
              from: 'categories', // name of collection
              localField: 'category', // the name of the field in the Book collection that want to join
              foreignField: '_id', // that is the field in the Category collection that the book field will be compared to
              as: 'category', // the new field that will be added to the Book document
            },
          },
          {
            $unwind: '$category', // transform the category field from array to object
          },
          {
            $project: {
              title: 1,
              description: 1,
              price: 1,
              stock: 1,
              category: { name: 1 }, //name จาก category
            },
          },
        ])
        .exec();

      if (results.length === 0) {
        throw new NotFoundException(
          'No books found matching with your searching',
        );
      }

      return results;
    } catch (error) {
      console.error('Search error:', error);
      throw new NotFoundException(`${error.message}`);
    }
  }

  async sellBook(id: string, quantity: number): Promise<string> {
    const book = await this.bookModel.findById(id).exec();
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

    // Update using plain numbers
    const updatedBook = await this.bookModel.findByIdAndUpdate(
      id,
      {
        $inc: {
          sold: quantity,
          stock: -quantity,
        },
      },
      { new: true, runValidators: true },
    );

    if (!updatedBook) {
      throw new Error('Failed to update book');
    }

    return 'sold successfully';
  }

  async getTopSellingBooks(): Promise<Book[]> {
    return this.bookModel
      .find({ isActive: true })
      .sort({ sold: -1 })
      .limit(5)
      .exec();
  }
}
