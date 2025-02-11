import { Body, Controller, Get, Post, Put, Param,Patch,Query } from '@nestjs/common';
import { BookService } from './book.service';
import { CreateBookDto } from './dto/create.dto';

@Controller('book')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Post()
  create(@Body() createBookDto: CreateBookDto) {
    return this.bookService.createBook(createBookDto);
  }

  @Get()
  getBooks() {
    return this.bookService.getBooks();
  }

  @Get('/search')
  searchBooks(@Query('q') query: string) {
    return this.bookService.searchBooks(query);
  }
  @Get(':id')
  getBookById(@Param('id') id: string) {
    return this.bookService.getBookById(id);
  }

  @Patch(':id')
    updateBook(@Param('id') id: string, @Body() updateBookDto: CreateBookDto) {
        return this.bookService.updateBook(id, updateBookDto);
    }

}
