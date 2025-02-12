import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Category, CategoryDocument } from './categoty.schema';
import { Model } from 'mongoose';
import { CreateCategoryDto } from './dto/create.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  async createCategory(
    createCategoryDto: CreateCategoryDto,
  ): Promise<Category> {
    const { name } = createCategoryDto;
    const existingCategory = await this.categoryModel.findOne({ name });

    if (existingCategory) {
      throw new ConflictException('Category with this name already exists.');
    }
    const newCategory = new this.categoryModel(createCategoryDto);

    return newCategory.save();
  }

  async getCategories(): Promise<Category[]> {
    return this.categoryModel.find().exec();
  }

  async getCategoryById(id: string): Promise<Category | null> {
    const category = await this.categoryModel
      .findById(id)
      .populate({
        path: 'books',
        select: 'title price',
      })
      .lean()
      .exec();

    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }
}
