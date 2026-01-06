import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AuthService } from './auth/auth.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const authService = app.get(AuthService);

  try {
    // Create default admin user
    const admin = await authService.createUser('admin', 'admin123');
    console.log('Default admin user created:', admin.username);
  } catch (error) {
    console.log('Admin user may already exist or error occurred:', error.message);
  }

  await app.close();
}

bootstrap();
