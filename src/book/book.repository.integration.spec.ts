import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { BookRepository } from './book.repository';
import { Book, BookSchema } from './book.schema';
import { CategorySchema } from '../category/categoty.schema';
import { Connection, Model } from 'mongoose';
import { BookDocument, CreateBookDto } from './dto/create.dto';
import { CreateCategory } from 'src/category/dto/create.dto';
import { Types } from 'mongoose';

describe('Book Repository Integration Tests', () => {
  let bookRepository: BookRepository;
  let connection: Connection;
  let module: TestingModule;
  let bookModel: Model<any>; //Mongoose Model
  let categoryModel: Model<any>;

  //reuse function
  async function createTestCategory(
    name: string = 'Test Category',
    description: string = 'Test Category Description',
  ): Promise<CreateCategory> {
    return categoryModel.create({
      name,
      description,
    }) as Promise<CreateCategory>;
  }

  async function createTestBook(
    categoryId: string | Types.ObjectId,
    override = {},
  ): Promise<BookDocument | null> {
    const categoryString =
      categoryId instanceof Types.ObjectId ? categoryId.toString() : categoryId;
    const defaultBook = {
      title: 'Test Book',
      description: 'Test Description',
      price: 299,
      stock: 10,
      isActive: true,
      sold: 0,
      category: categoryString,
    };
    return bookModel.create({
      ...defaultBook,
      ...override,
    }) as Promise<BookDocument>;
  }

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(
          'mongodb+srv://admin:aa9543976@cluster0.jgru9.mongodb.net/?retryWrites=true&w=majority',
          {
            dbName: 'bookstore_test',
          },
        ),
        MongooseModule.forFeature([
          { name: Book.name, schema: BookSchema },
          { name: 'Category', schema: CategorySchema },
        ]),
      ],
      providers: [BookRepository],
    }).compile();

    bookRepository = module.get<BookRepository>(BookRepository);
    connection = module.get(getConnectionToken());
    bookModel = connection.model(Book.name, BookSchema);
    categoryModel = connection.model('Category', CategorySchema);
  });

  beforeEach(async () => {
    for (const collection of Object.values(connection.collections)) {
      await collection.deleteMany({});
    }
  });

  afterAll(async () => {
    // disconnect
    await connection.close();
  });

  it('should create a book in the database', async () => {
    // Arrange

    const category = await createTestCategory('Test Category 2');

    const bookData: CreateBookDto = {
      title: 'Test Book 2',
      description: 'Test Description',
      price: 299,
      stock: 10,
      isActive: true,
      category: category?._id.toString(),
    };

    // Act
    const result = await bookRepository.create(bookData);

    // Assert
    expect(result).toBeDefined();

    const bookDoc = result as BookDocument;
    expect(bookDoc._id).toBeDefined();
    expect(result.title).toEqual(bookData.title);
    expect(result.price).toEqual(bookData.price);

    await new Promise((resolve) => setTimeout(resolve, 100));
    // Verify in database
    const storedBook: BookDocument | null = await bookModel.findOne({
      _id: bookDoc._id,
    });
    expect(storedBook).toBeDefined();
    expect(storedBook).not.toBeNull();
    expect(storedBook?.title).toEqual(bookData.title);
  });

  it('should get all books in database', async () => {
    //Arrange
    const category = await createTestCategory();

    await createTestBook(category._id, {
      title: 'Test Book 1',
      description: 'Test Description 1',
    });

    await createTestBook(category._id, {
      title: 'Test Book 2',
      description: 'Test Description 2',
      price: 399,
      stock: 5,
      sold: 2,
    });

    await createTestBook(category._id, {
      title: 'Inactive Book',
      description: 'This book is inactive',
      price: 199,
      stock: 8,
      isActive: false,
    });

    const result = await bookRepository.findAll();

    //Assert
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.every((book) => book.isActive === true)).toBe(true);
  });

  it('should find a book by Id with category detail', async () => {
    //Arrange
    const category = await createTestCategory('Novel', 'Fiction novels');

    const createBook: BookDocument | null = await createTestBook(category._id, {
      title: 'The Great Novel',
      description: 'A bestselling book',
      price: 350,
      stock: 15,
    });
    const result = await bookRepository.findBookById(
      createBook!._id.toString(),
    );

    expect(result).toBeDefined();
    expect(result).not.toBeNull();
    expect(result?.title).toEqual(createBook?.title);
    expect(result?.category).toBeDefined();
  });

  it('should update book by Id', async () => {
    const category = await createTestCategory('Technology', 'Tech books');

    const createdBook = await createTestBook(category._id, {
      title: 'Programming 101',
      description: 'Introduction to programming',
      price: 450,
      stock: 20,
    });

    const updateData = {
      title: 'Programming 102',
      price: 500,
      description: 'Advanced programming concepts',
    };

    const result = await bookRepository.updateById(
      createdBook!._id.toString(),
      updateData,
    );
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(result).toBeDefined();
    expect(result?.title).toEqual(updateData?.title);

    //verify in database
    const updatedBook = (await bookModel.findById(
      createdBook!._id,
    )) as BookDocument; //ตรวจสอบแบบไม่ผ่าน repository
    expect(updatedBook?.title).toEqual(updateData?.title);
  });

  it('should update stock quantity', async () => {
    const category = await createTestCategory(
      'Self-Help',
      'Self improvement books',
    );

    const createdBook = (await createTestBook(category._id, {
      title: 'Mindfulness',
      description: 'Guide to mindfulness',
      price: 250,
    })) as BookDocument;
    const stockChange = 3;

    const result = await bookRepository.updateStock(
      createdBook._id.toString(),
      stockChange,
    );

    expect(result).toBeDefined();
    expect(result?.stock).toEqual(createdBook?.stock + stockChange);

    const updateBook = (await bookModel.findById(
      createdBook._id,
    )) as BookDocument;
    expect(updateBook?.stock).toEqual(createdBook.stock + stockChange);
  });

  it('should update sales when a book is purchased', async () => {
    const category = await createTestCategory('Biography', 'Biography books');

    const createdBook = await createTestBook(category._id, {
      title: 'Famous Person',
      description: 'Life story of a famous person',
      price: 300,
      stock: 15,
      sold: 5,
    });
    const purchaseQuantity = 2;

    const result = await bookRepository.updateSales(
      createdBook!._id.toString(),
      purchaseQuantity,
    );

    expect(result).toBeDefined();
    expect(result?.sold).toEqual(createdBook!.sold + purchaseQuantity);
    expect(result?.stock).toEqual(createdBook!.stock - purchaseQuantity);

    const updateBook: BookDocument | null = await bookModel.findById(
      createdBook!._id,
    );
    expect(updateBook?.sold).toEqual(createdBook!.sold + purchaseQuantity);
  });

  it('should find top selling books', async () => {
    const category = await createTestCategory('Fiction', 'Fiction books');

    await createTestBook(category._id, { title: 'Book A', sold: 30 });
    await createTestBook(category._id, {
      title: 'Book B',
      price: 250,
      sold: 50,
    });
    await createTestBook(category._id, {
      title: 'Book C',
      price: 300,
      sold: 10,
    });
    await createTestBook(category._id, {
      title: 'Book D',
      price: 350,
      sold: 40,
    });
    await createTestBook(category._id, {
      title: 'Book E',
      price: 400,
      sold: 20,
    });
    await createTestBook(category._id, {
      title: 'Inactive Book',
      price: 150,
      stock: 3,
      isActive: false,
      sold: 100,
    });

    const result = await bookRepository.findTopSelling(3);

    expect(result).toBeDefined();
    expect(result.length).toEqual(3);
  });

  it('should search books by query string', async () => {
    // Arrange
    const category = await createTestCategory(
      'Programming',
      'Programming books',
    );

    await createTestBook(category._id, {
      title: 'JavaScript Basics',
      description: 'Learn the fundamentals of JavaScript',
    });

    await createTestBook(category._id, {
      title: 'Advanced JavaScript',
      description: 'Master advanced concepts in JavaScript',
    });

    await createTestBook(category._id, {
      title: 'Python Programming',
      description: 'Introduction to Python language',
    });

    await createTestBook(category._id, {
      title: 'Data Science with Python',
      description: 'Learn data analysis using Python libraries',
    });

    const result = await bookRepository.search('JavaScript');

    // Assert
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);

    result.forEach((book) => {
      const hasJavaScriptInTitle = book.title?.includes('JavaScript');
      const hasJavaScriptInDescription =
        book.description?.includes('JavaScript');
      expect(hasJavaScriptInTitle || hasJavaScriptInDescription).toBe(true);
    });
  });
});
