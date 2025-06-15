import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { BridgeAdapterService } from './bridge-adapter.service';

@Module({
  imports: [HttpModule],
  controllers: [],
  providers: [BridgeAdapterService],
  exports: [BridgeAdapterService],
})
export class BridgeAdapterModule {}
