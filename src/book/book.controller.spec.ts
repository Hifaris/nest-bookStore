import { Test, TestingModule } from '@nestjs/testing';
import { BookController } from './book.controller';
import { BookService } from './book.service';
import { CreateBookDto, updateBookDto } from './dto/create.dto';
import { Types } from 'mongoose';
import { SellBookDto } from './dto/sell.dto';

jest.mock('../category/category.service');
jest.mock('./book.repository');
const mockBookService = {
  createBook: jest.fn(),
  getBooks: jest.fn(),
  searchBooks: jest.fn(),
  getTopSellingBooks: jest.fn(),
  getBookById: jest.fn(),
  updateBook: jest.fn(),
  sellBook: jest.fn(),
};

describe('BookController', () => {
  let bookController: BookController;
  let bookService: BookService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [BookController],
      providers: [
        {
          provide: BookService,
          useValue: mockBookService,
        },
      ],
    }).compile();

    bookService = moduleRef.get<BookService>(BookService);
    bookController = moduleRef.get<BookController>(BookController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create book', () => {
    it('should create new book and return a new book', async () => {
      // สร้าง DTO ที่จะใช้ทดสอบ
      const categoryId = new Types.ObjectId();
      const newBook: CreateBookDto = {
        title: 'Test Book',
        description: 'Test Description',
        price: 100,
        stock: 100,
        category: categoryId.toString(),
      };

      const expectedResult = {
        _id: new Types.ObjectId(),
        title: 'Test Book',
        description: 'Test Description',
        price: 100,
        stock: 100,
        category: categoryId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockBookService.createBook.mockResolvedValue(expectedResult);

      const result = await bookController.create(newBook);

      expect(mockBookService.createBook).toHaveBeenCalledWith(newBook);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getBooks', () => {
    it('should get all books', async () => {
      const allBooks = [
        {
          _id: new Types.ObjectId(),
          title: 'Test Book 1',
          description: 'Test Description',
          price: 100,
          stock: 100,
          category: '123456',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          _id: new Types.ObjectId(),
          title: 'Test Book 2',
          description: 'Test Description',
          price: 100,
          stock: 100,
          category: '123456',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockBookService.getBooks.mockResolvedValue(allBooks);

      const result = await bookController.getBooks();

      expect(mockBookService.getBooks).toHaveBeenCalledWith();
      expect(result).toEqual(allBooks);
    });
  });

  describe('searchBooks', () => {
    it('should return array books matching with query', async () => {
      const query: string = 'Test';
      const matchBooks = [
        {
          _id: new Types.ObjectId(),
          title: 'Test Book 1',
          description: 'Test Description',
          price: 100,
          stock: 100,
          category: '123456',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          _id: new Types.ObjectId(),
          title: 'Test Book 2',
          description: 'Test Description',
          price: 100,
          stock: 100,
          category: '123456',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockBookService.searchBooks.mockResolvedValue(matchBooks);

      const result = await bookController.searchBooks(query);

      expect(mockBookService.searchBooks).toHaveBeenCalledWith(query);
      expect(result).toEqual(matchBooks);
    });
  });

  describe('getTopSellingBooks', () => {
    it('should get top selling books', async () => {
      const topSalesBooks = [
        {
          _id: new Types.ObjectId(),
          title: 'Test Book 1',
          description: 'Test Description',
          price: 100,
          stock: 100,
          sold: 100,
        },
        {
          _id: new Types.ObjectId(),
          title: 'Test Book 2',
          description: 'Test Description',
          price: 100,
          stock: 100,
          category: '123456',
          sold: 300,
        },
        {
          _id: new Types.ObjectId(),
          title: 'Test Book 3',
          description: 'Test Description',
          price: 100,
          stock: 100,
          category: '123456',
          sold: 400,
        },
      ];

      mockBookService.getTopSellingBooks.mockResolvedValue(topSalesBooks);

      const result = await bookController.getTopSellingBooks();

      expect(mockBookService.getTopSellingBooks).toHaveBeenCalledWith();
      expect(result).toEqual(topSalesBooks);
    });
  });

  describe('getBookById', () => {
    it('should get a book by Id', async () => {
      const id: string = '123456';
      const book = {
        _id: new Types.ObjectId(),
        title: 'Test Book 1',
        description: 'Test Description',
        price: 100,
        stock: 100,
        category: { name: 'IT' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockBookService.getBookById.mockResolvedValue(book);

      const result = await bookController.getBookById(id);

      expect(mockBookService.getBookById).toHaveBeenCalledWith(id);
      expect(result).toEqual(book);
    });
  });

  describe('updateBook', () => {
    it('should update book by Id', async () => {
      const id: string = '1234567';
      const updateBook: updateBookDto = {
        title: 'This is updated book',
      };
      const book = {
        _id: new Types.ObjectId(),
        title: 'This is updated book',
        description: 'Test Description',
        price: 100,
        stock: 100,
        category: '123456',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockBookService.updateBook.mockResolvedValue(book);

      const result = await bookController.updateBook(id, updateBook);

      expect(mockBookService.updateBook).toHaveBeenCalledWith(id, updateBook);
      expect(result).toEqual(book);
    });
  });

  describe('sellBook', () => {
    it('should sell book with Id and decrease quantity of stock and increasing sales', async () => {
      const bookId: string = '123456789';
      const sellBookDto = {
        quantity: 30,
      };

      const book = {
        _id: new Types.ObjectId(),
        title: 'This is updated book',
        description: 'Test Description',
        price: 100,
        stock: 70,
        sold: 30,
        category: '123456',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockBookService.sellBook.mockResolvedValue(book);

      const result = await bookController.sellBook(bookId, sellBookDto);
      expect(mockBookService.sellBook).toHaveBeenCalledWith(bookId, sellBookDto.quantity);
      expect(result).toEqual(book);
    });
  });
});
