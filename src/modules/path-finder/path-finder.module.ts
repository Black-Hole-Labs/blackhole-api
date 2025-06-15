import { Module } from '@nestjs/common';
import { PathFinderService } from './path-finder.service';
import { BridgeAdapterModule } from '../bridge-adapter/bridge-adapter.module';

@Module({
  imports: [BridgeAdapterModule],
  providers: [PathFinderService],
  exports: [PathFinderService],
})
export class PathFinderModule {}
