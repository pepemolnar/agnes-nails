import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AuthService } from './auth/auth.service';
import { ServicesService } from './services/services.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  });

  // Enable validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Create default admin user if none exists
  const authService = app.get(AuthService);
  try {
    await authService.createUser('admin', 'admin123');
    console.log('Default admin user created: username=admin, password=admin123');
  } catch (error) {
    console.log('Admin user already exists or error occurred');
  }

  // Initialize default services if none exist
  const servicesService = app.get(ServicesService);
  try {
    await servicesService.initializeDefaultServices();
    console.log('Default services initialized');
  } catch (error) {
    console.log('Services already exist or error occurred');
  }

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
