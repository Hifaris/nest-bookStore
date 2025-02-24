import { Injectable } from '@nestjs/common';
import { Category } from './categoty.schema';
import { CreateCategoryDto } from './dto/create.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CategoryRepository } from './category.repository';

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async createCategory(
    createCategoryDto: CreateCategoryDto,
  ): Promise<Category> {
    const { name } = createCategoryDto;
    const existingCategory = await this.categoryRepository.findByName(name);

    if (existingCategory) {
      throw new ConflictException('Category with this name already exists.');
    }

    return this.categoryRepository.create(createCategoryDto);
  }

  async getCategories(): Promise<Category[]> {
    return this.categoryRepository.findAll();
  }

  async getCategoryById(id: string): Promise<Category> {
    const category = await this.categoryRepository.findById(id);

    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }
}
