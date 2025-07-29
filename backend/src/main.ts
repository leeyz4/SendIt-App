/* eslint-disable prettier/prettier */
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { JwtAuthGuard } from './auth/Guards/jwt-auth.guard';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

// Log loaded ENV values for debugging
console.log('🔐 JWT Config:', {
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
});
console.log('🌍 Frontend URL:', process.env.FRONTEND_URL);
console.log('📧 Mail Host:', process.env.MAIL_HOST);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // Enable CORS for frontend connection
  app.enableCors({
    origin: 'http://localhost:4200',
    methods: 'GET,POST,PATCH,DELETE',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // Set up global JWT guard
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector));

  // Swagger API docs setup
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Sendly App')
    .setDescription('API documentation for the Sendly Application')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  logger.log(`🚀 Application running on http://localhost:${port}`);
  logger.log(`📚 Swagger Docs available at http://localhost:${port}/api`);
}
bootstrap();
