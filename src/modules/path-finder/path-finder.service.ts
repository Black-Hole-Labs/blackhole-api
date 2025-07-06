import { Injectable } from '@nestjs/common';
import { BridgeAdapterService } from '../bridge-adapter/bridge-adapter.service';
import { QuoteParams } from '../bridge-adapter/interfaces/adapter-service.interface';

@Injectable()
export class PathFinderService {
  constructor(private readonly bridgeAdapterService: BridgeAdapterService) {}

  async findBestPath(params: QuoteParams) {
    const adaptersArray = this.bridgeAdapterService.AdaptersArray;

    const result = await Promise.all(
      adaptersArray.map(async (adapter) => {
        return adapter.getQuote(params);
      }),
    );

    console.log('result: ', result);
    const bestRoute = result.sort((a, b) => +a.outputAmount - +b.outputAmount)[0];
    console.log('sortedResult: ', bestRoute);

    const calldata = '';

    return bestRoute;
    // return {
    //   quoteRelay,
    //   quoteAcross,
    // };
  }
}
