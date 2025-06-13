import { Module } from '@nestjs/common';
import { BridgeAdapterModule } from './modules/bridge-adapter/bridge-adapter.module';
import { PathFinderModule } from './modules/path-finder/path-finder.module';
import { V1Module } from './modules/v1/v1.module';

@Module({
  imports: [V1Module, PathFinderModule, BridgeAdapterModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
