import { Module } from '@nestjs/common';

import { BridgeAdapterService } from './bridge-adapter.service';

@Module({
  controllers: [],
  providers: [BridgeAdapterService],
})
export class BridgeAdapterModule {}
