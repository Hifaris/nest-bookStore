import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Category, CategoryDocument } from './categoty.schema';
import { Model } from 'mongoose';
import { CreateCategoryDto } from './dto/create.dto';

@Injectable()
export class CategoryService {
    constructor(@InjectModel(Category.name) private categoryModel: Model<CategoryDocument>) {}

    async createCategory(createCategoryDto:CreateCategoryDto): Promise<Category> {
      const newCategory = new this.categoryModel(createCategoryDto);
      return newCategory.save();
    }
  
    async getCategories(): Promise<Category[]> {
      return this.categoryModel.find().exec();
    }

    async getCategoryById(id: string): Promise<Category | null> {
      return this.categoryModel.findById(id).exec();
    }
}
