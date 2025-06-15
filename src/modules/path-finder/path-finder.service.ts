import { Injectable } from '@nestjs/common';
import { BridgeAdapterService } from '../bridge-adapter/bridge-adapter.service';
import { AdaptersType } from '../bridge-adapter/types/adapters.enum';

@Injectable()
export class PathFinderService {
  constructor(private readonly bridgeAdapterService: BridgeAdapterService) {}

  async findBestPath(params: any) {
    const adapter = this.bridgeAdapterService.AdaptersMap.get(AdaptersType.RELAY);
    if (!adapter) {
      throw new Error('Adapter not found');
    }
    const quote = await adapter.getQuote(params);
    console.log(quote);
  }
}
