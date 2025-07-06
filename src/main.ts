import { NestApplication, NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger(NestApplication.name);
  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.useGlobalFilters();
  app.enableShutdownHooks();
  await app.listen(process.env.PORT ?? 3000);

  process.on('uncaughtException', async (error: any) => {
    logger.error('Uncaught Exception:', error?.message);
    logger.error(error);
  });
}
bootstrap();
