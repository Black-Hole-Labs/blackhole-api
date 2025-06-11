import { Module } from '@nestjs/common';
import { V1Module } from './modules/v1/v1.module';

@Module({
  imports: [V1Module],
  controllers: [],
  providers: [],
})
export class AppModule {}
