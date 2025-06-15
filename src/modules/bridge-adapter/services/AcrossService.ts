import { BaseAdapter, QuoteParams, UnifiedQuoteResponse } from '../interfaces/adapter-service.interface';

export class AcrossService implements BaseAdapter {
  async getQuote({ originChainId, destinationChainId, amount, originCurrency, destinationCurrency }: QuoteParams) {
    return {} as UnifiedQuoteResponse;
  }
}
