import { Injectable } from '@nestjs/common';
import { BridgeAdapterService } from '../bridge-adapter/bridge-adapter.service';
import { QuoteParams } from '../bridge-adapter/interfaces/adapter-service.interface';

@Injectable()
export class PathFinderService {
  constructor(private readonly bridgeAdapterService: BridgeAdapterService) {}

  async findBestPath(params: QuoteParams) {
    const adaptersArray = this.bridgeAdapterService.AdaptersArray;

    const results = await Promise.all(
      adaptersArray.map(async (adapter) => {
        return adapter.getQuote(params);
      }),
    );

    // Фильтруем null значения
    const validResults = results.filter((result) => result !== null);

    if (validResults.length === 0) {
      throw new Error('No adapters available for this request');
    }
    console.log('validResults: ', validResults);
    const bestRoute = validResults.sort((a, b) => +b.outputAmount - +a.outputAmount)[0];
    // console.log('bestRoute: ', bestRoute);
    const bestRouteAdapter = this.bridgeAdapterService.AdaptersMap.get(bestRoute.metaData.adapter);
    const calldata = await bestRouteAdapter.generateCalldata(params, bestRoute);

    return {
      inputAmount: bestRoute.inputAmount,
      outputAmount: bestRoute.outputAmount,
      adapter: bestRoute.metaData.adapter,
      calldata,
    };
  }
}
