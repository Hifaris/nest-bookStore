import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { BookService } from './book.service';
import { CreateBookDto, updateBookDto } from './dto/create.dto';
import { SellBookDto } from './dto/sell.dto';

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
  @Get('/top-selling')
  getTopSellingBooks() {
    return this.bookService.getTopSellingBooks();
  }
  @Get('/:id')
  getBookById(@Param('id') id: string) {
    return this.bookService.getBookById(id);
  }

  @Patch('/:id')
  updateBook(@Param('id') id: string, @Body() updateBookDto: updateBookDto) {
    return this.bookService.updateBook(id, updateBookDto);
  }

  @Post('/sell/:bookId')
  sellBook(
    @Param('bookId') bookId: string,
    @Body() sellBookDto: SellBookDto,
  ): Promise<string> {
    return this.bookService.sellBook(bookId, sellBookDto.quantity);
  }
}
