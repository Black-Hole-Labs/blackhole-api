import { Module } from '@nestjs/common';
import { BridgeAdapterModule } from './bridge-adapter/bridge-adapter.module';
import { PathFinderModule } from './path-finder/path-finder.module';
import { V1Module } from './v1/v1.module';

@Module({
  imports: [V1Module, PathFinderModule, BridgeAdapterModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
