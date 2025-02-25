import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Book, BookDocument } from './book.schema';
import mongoose, { Model } from 'mongoose';
import { BookWithCategory, updateBookDto } from './dto/create.dto';

@Injectable()
export class BookRepository {
  constructor(@InjectModel(Book.name) private bookModel: Model<BookDocument>) {}

  async create(bookData: any): Promise<Book> {
    return this.bookModel.create(bookData);
  }

  async findAll(isActive: boolean = true): Promise<Book[]> {
    return this.bookModel.find({ isActive }).exec();
  }

  async findById(id: string): Promise<BookWithCategory | null> {
    const book = await this.bookModel.aggregate<BookWithCategory>([
      {
        $match: { _id: new mongoose.Types.ObjectId(id) }, //change string to object id, don't have mongoose to convert id to object id like findById
      },
      {
        $lookup: {
          from: 'categories', // collection name
          localField: 'category',
          foreignField: '_id',
          as: 'category', // new field name to collect
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
      return null;
    }
    return book[0];
  }

  async updateById(
    id: string,
    updateData: updateBookDto,
  ): Promise<Book | null> {
    return this.bookModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
  }

  async updateStock(id: string, stockChange: number): Promise<Book | null> {
    return this.bookModel.findByIdAndUpdate(
      id,
      {
        $inc: {
          stock: stockChange,
        },
      },
      { new: true, runValidators: true },
    );
  }

  async findBookById(id: string): Promise<Book | null> {
    return this.bookModel.findById(id).exec();
  }

  async updateSales(id: string, quantity: number): Promise<Book | null> {
    return this.bookModel.findByIdAndUpdate(
      id,
      {
        $inc: {
          sold: +quantity,
          stock: -quantity,
        },
      },
      { new: true, runValidators: true },
    );
  }

  async findTopSelling(limit: number = 5): Promise<Book[]> {
    return this.bookModel
      .find({ isActive: true })
      .sort({ sold: -1 })
      .limit(limit)
      .exec();
  }

  async search(query: string): Promise<BookWithCategory[]> {
    return this.bookModel.aggregate<BookWithCategory>([
      {
        $search: {
          index: 'bookSearch',
          compound: {
            should: [
              {
                wildcard: {
                  query: query + '*',
                  path: 'title',
                  allowAnalyzedField: true,
                },
              },
              {
                wildcard: {
                  query: query + '*',
                  path: 'description',
                  allowAnalyzedField: true,
                },
              },
            ],
          },
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'category',
        },
      },
      {
        $unwind: '$category',
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
  }
}
