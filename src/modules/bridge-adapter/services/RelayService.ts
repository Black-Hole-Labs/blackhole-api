import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { BaseAdapter, QuoteParams, UnifiedQuoteResponse } from '../interfaces/adapter-service.interface';
import { BridgeError } from '../errors/errors';

export class RelayService implements BaseAdapter {
  relayUrl = 'https://api.relay.link/';
  constructor(private readonly httpService: HttpService) {}

  async getQuote(params: QuoteParams) {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post(`${this.relayUrl}/quote`, {
          body: params,
        }),
      );
      // return data;
      const response: UnifiedQuoteResponse = {
        inputAmount: data.inputAmount,
        outputAmount: data.outputAmount,
        fees: data.fees,
        inputToken: data.inputToken,
        outputToken: data.outputToken,
      };
      console.log(data);
      return response;
    } catch (error) {
      throw new BridgeError(
        error.response?.data?.message || 'Bridge service error',
        error.response?.status?.toString(),
        error.response?.data,
      );
    }
  }
}
