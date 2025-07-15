import { BaseAdapter, QuoteParams } from '@modules/bridge-adapter/interfaces/adapter-service.interface';
import { HttpService } from '@nestjs/axios';

export class MayanAdapter implements BaseAdapter {
  constructor(private readonly httpService: HttpService) {}

  async getQuote({
    originChainId,
    destinationChainId,
    amount,
    originCurrency,
    destinationCurrency,
    senderAddress,
    receiverAddress,
  }: QuoteParams) {
    return null;
  }

  async generateCalldata(params: QuoteParams) {
    return null;
  }
}
