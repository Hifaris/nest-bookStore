import { Body, Controller, Post, Get, Param } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create.dto';
import { CategoryService } from './category.service';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  async createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.createCategory(createCategoryDto);
  }

  @Get()
  async getCategory() {
    return this.categoryService.getCategories();
  }

  @Get('/:id')
  async getCategoryById(@Param('id') id: string) {
    return this.categoryService.getCategoryById(id);
  }
}
