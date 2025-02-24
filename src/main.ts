import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, BadRequestException } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // ตัด properties ที่ไม่อยู่ใน DTO
      forbidNonWhitelisted: true, // ถ้ามี properties ที่ไม่อยู่ใน DTO จะเกิด error
      transform: true, // แปลงชนิดข้อมูลให้ตรงกับ DTO
      exceptionFactory: (errors) => {
        //รับ errors ที่เกิดจากการ Validation ล้มเหลว
        const messages = errors.map((error) => ({
          field: error.property,
          message: error.constraints
            ? Object.values(error.constraints).join('. ') + '.'
            : 'Validation error.', //กรณีไม่มี constraints
        }));
        return new BadRequestException({ errors: messages });
      },
    }),
  );
  app.enableCors({
    origin: 'http://localhost:4200',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  await app.listen(3000);
}
bootstrap();
