import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
