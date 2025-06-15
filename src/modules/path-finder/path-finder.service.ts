import { Injectable } from '@nestjs/common';
import { BridgeAdapterService } from '../bridge-adapter/bridge-adapter.service';
import { AdaptersType } from '../bridge-adapter/types/adapters.enum';
import { QuoteParams } from '../bridge-adapter/interfaces/adapter-service.interface';

@Injectable()
export class PathFinderService {
  constructor(private readonly bridgeAdapterService: BridgeAdapterService) {}

  async findBestPath(params: any) {
    const adapter = this.bridgeAdapterService.AdaptersMap.get(AdaptersType.RELAY);
    if (!adapter) {
      throw new Error('Adapter not found');
    }
    const _params: QuoteParams = {
      // useReceiver: true,
      walletAddress: '0x2cBBdc07de366d5964b47F0c178b5114781a6BE9',
      originChainId: 42161,
      destinationChainId: 10,
      originCurrency: '0xaf88d065e77c8cc2239327c5edb3a432268e5831',
      destinationCurrency: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
      amount: '10000000',
      tradeType: 'EXACT_INPUT',
    };
    const quote = await adapter.getQuote(_params);
    console.log(quote);
  }
}
