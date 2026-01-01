import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Enable global validation pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        const messages = errors.map((error) => {
          return `${error.property}: ${Object.values(error.constraints || {}).join(', ')}`;
        });
        return new Error(`Validation failed: ${messages.join('; ')}`);
      },
    }),
  );

  // Enable CORS for web clients
  app.enableCors({
    origin: true, // Configure for production
    credentials: true,
  });

  await app.listen(3000);
  console.log('API server running on http://localhost:3000');
  console.log('Socket.io server running on ws://localhost:3000/chat');
}
bootstrap();
