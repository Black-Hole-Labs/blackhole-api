import { Module } from '@nestjs/common';
import { BridgeAdapterModule } from './bridge-adapter/bridge-adapter.module';
import { PathFinderModule } from './path-finder/path-finder.module';
import { V1Module } from './v1/v1.module';
import { CalldataModuleModule } from './calldata-module/calldata-module.module';

@Module({
  imports: [V1Module, PathFinderModule, BridgeAdapterModule, CalldataModuleModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
