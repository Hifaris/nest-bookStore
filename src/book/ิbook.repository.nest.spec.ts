import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BookRepository } from './book.repository';
import { Book } from './book.schema';
import { Types } from 'mongoose';
import { CreateBookDto, updateBookDto } from './dto/create.dto';

// create mock of Model
const mockBookModel = {
  create: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
  findOne: jest.fn(),
  findByIdAndUpdate: jest.fn(), //mock functions ไว้สำหรับทุกเมธอดของ Mongoose Model ที่ BookRepository จะเรียกใช้
  aggregate: jest.fn(),
  save: jest.fn(),
};

describe('Book Repository', () => {
  let bookRepository: BookRepository;
  let bookModel: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookRepository,
        {
          provide: getModelToken(Book.name),
          useValue: mockBookModel, // // ใช้ mockBookModel เป็นค่า
        },
      ],
    }).compile();
    // ดึง repository และ model ที่ mock ไว้
    bookRepository = module.get<BookRepository>(BookRepository);
    bookModel = module.get(getModelToken(Book.name));
  });
  //clean all mock after each test
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new book', async () => {
      //Arrange
      const bookData: CreateBookDto = {
        title: 'Test Book',
        description: 'Test Description',
        price: 100,
        stock: 100,
        category: new Types.ObjectId().toString(),
      };

      const expectedResult = {
        _id: new Types.ObjectId(),
        ...bookData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock เมธอด create ให้คืนค่าที่ต้องการ
      bookModel.create.mockResolvedValue(expectedResult);

      //Act
      const result = await bookRepository.create(bookData);

      //Assert
      expect(bookModel.create).toHaveBeenCalledWith(bookData);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('Find all books', () => {
    it('should return all active books', async () => {
      //Arrange
      const expectedBooks = [
        {
          _id: new Types.ObjectId(),
          title: 'Book 1',
          isActive: true,
          category: '67ab1d5a1b5a94c65d0d8ebb',
          description:
            'Atomic Habits is a proven framework for improving every day',
          price: 18.49,
          stock: 200,
          createdAt: new Date(),
          updatedAt: new Date(),
          sold: 200,
        },
        {
          _id: new Types.ObjectId(),
          title: 'Book 2',
          isActive: true,
          category: '67ab1d5a1b5a94c65d0d8ebb',
          description:
            'Atomic Habits is a proven framework for improving every day',
          price: 18.49,
          stock: 200,
          createdAt: new Date(),
          updatedAt: new Date(),
          sold: 200,
        },
      ];
      // find ไม่ได้ return Promise  โดยตรง แต่ return object ที่มีเมธอด exec()
      mockBookModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(expectedBooks),
      });

      const result = await bookRepository.findAll();

      expect(mockBookModel.find).toHaveBeenCalledWith({ isActive: true });
      expect(result).toEqual(expectedBooks);
    });
  });

  describe('Find book by Id', () => {
    it('should find book by id', async () => {
      //Arrange
      const bookId = new Types.ObjectId().toString();
      const expectedBook = {
        _id: new Types.ObjectId(bookId),
        title: 'The world of Technology ',
        description: 'The power of information technology',
        price: 14.99,
        category: [
          {
            name: 'IT',
          },
        ],
        stock: 140,
      };

      mockBookModel.aggregate.mockResolvedValue([expectedBook]);
      //Act
      const result = await bookRepository.findById(bookId);

      //Assert
      expect(mockBookModel.aggregate).toHaveBeenCalledWith(
        expect.arrayContaining([
          { $match: expect.objectContaining({ _id: expect.any(Object) }) }, // ใช้ objectContaining เพราะเราไม่สามารถตรวจสอบค่า ObjectId ได้โดยตรง
          {
            $lookup: expect.objectContaining({
              from: 'categories',
              localField: 'category',
              foreignField: '_id',
              as: 'category',
            }),
          },
          { $project: expect.any(Object) },
        ]),
      );
      expect(result).toEqual(expectedBook);
    });
  });

  describe('updatedById', () => {
    it('should update book by id', async () => {
      //Arrange
      const bookId = new Types.ObjectId().toString();
      const updateData: updateBookDto = { title: 'This is updated book' };
      const expectedBook = {
        _id: new Types.ObjectId(bookId),
        title: 'This is updated book',
        isActive: true,
        category: '67ab1d5a1b5a94c65d0d8ebb',
        description:
          'Atomic Habits is a proven framework for improving every day',
        price: 18.49,
        stock: 200,
        createdAt: new Date(),
        updatedAt: new Date(),
        sold: 200,
      };

      mockBookModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(expectedBook),
      });

      //Act
      const result = await bookRepository.updateById(bookId, updateData);

      //Assert
      expect(mockBookModel.findByIdAndUpdate).toHaveBeenCalledWith(
        bookId,
        updateData,
        { new: true },
      );
      expect(result).toEqual(expectedBook);
    });
  });

  describe('search', () => {
    it('should search books with query', async () => {
      const query: string = 'test';
      const expectedBooks = [
        {
          _id: new Types.ObjectId(),
          title: 'test book',
          description:
            'This book explores the science behind habit formation and how it can be used to improve various aspects of life and business',
          price: 15.99,
          category: {
            name: 'Improvment',
          },
          stock: 120,
        },
        {
          _id: new Types.ObjectId(),
          title: 'test book',
          description:
            'This book explores the science behind habit formation and how it can be used to improve various aspects of life and business',
          price: 15.99,
          category: {
            name: 'Improvment',
          },
          stock: 120,
        },
      ];

      mockBookModel.aggregate.mockResolvedValue(expectedBooks);

      //Act
      const result = await bookRepository.search(query);

      //Assert
      expect(mockBookModel.aggregate).toHaveBeenCalledWith(
        expect.arrayContaining([
          { $search: expect.any(Object) },
          { $lookup: expect.any(Object) },
          { $unwind: expect.any(String) },
          { $project: expect.any(Object) },
        ]),
      );
      expect(result).toEqual(expectedBooks);
    });
  });

  it('should return top selling books', async () => {
    const topBooks = [
      {
        _id: new Types.ObjectId(),
        title: 'Best Seller 1',
        sold: 1000,
        isActive: true,
      },
      {
        _id: new Types.ObjectId(),
        title: 'Best Seller 2',
        sold: 800,
        isActive: true,
      },
    ];

    mockBookModel.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(topBooks),
        }),
      }),
    });

    //Act
    const result = await bookRepository.findTopSelling(2);

    expect(mockBookModel.find).toHaveBeenCalledWith({ isActive: true });
    expect(mockBookModel.find().sort).toHaveBeenCalledWith({ sold: -1 });
    expect(mockBookModel.find().sort().limit).toHaveBeenCalledWith(2);
    expect(result).toEqual(topBooks);
  });

  it('should update book sales and decrease stock', async () => {
    const bookId = new Types.ObjectId().toString();
    const quantity = 5;

    const expectedBook = {
      _id: new Types.ObjectId(bookId),
      title: 'Book 1',
      isActive: true,
      category: '67ab1d5a1b5a94c65d0d8ebb',
      description:
        'Atomic Habits is a proven framework for improving every day',
      price: 18.49,
      stock: 200,
      createdAt: new Date(),
      updatedAt: new Date(),
      sold: 200,
    };

    mockBookModel.findByIdAndUpdate.mockResolvedValue(expectedBook);

    //Act
    const result = await bookRepository.updateSales(bookId, quantity);

    //Assert
    expect(mockBookModel.findByIdAndUpdate).toHaveBeenCalledWith(
      bookId,
      {
        $inc: {
          sold: +quantity,
          stock: -quantity,
        },
      },
      { new: true, runValidators: true },
    );
    expect(result).toEqual(expectedBook);
  });
});
