import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { BaseAdapter, QuoteParams, UnifiedQuoteResponse } from '../../interfaces/adapter-service.interface';
import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { RelayQuoteResponse } from './types';
import { AdaptersType } from '@modules/bridge-adapter/types/adapters.enum';

@Injectable()
export class RelayService implements BaseAdapter {
  relayUrl = 'https://api.relay.link';
  constructor(private readonly httpService: HttpService) {}

  async getQuote(params: QuoteParams) {
    try {
      const body = {
        userReceiver: true,
        user: params.senderAddress,
        originChainId: params.originChainId,
        destinationChainId: params.destinationChainId,
        originCurrency: params.originCurrency,
        destinationCurrency: params.destinationCurrency,
        amount: params.amount,
        tradeType: params.tradeType,
      };

      const { data } = await firstValueFrom(this.httpService.post<RelayQuoteResponse>(`${this.relayUrl}/quote`, body));

      const response: UnifiedQuoteResponse = {
        metaData: {
          adapter: AdaptersType.RELAY,
        },
        inputAmount: data.details.currencyIn.amount,
        outputAmount: data.details.currencyOut.amount,
        fees: [],
        inputToken: {
          address: data.details.currencyIn.currency.address,
          symbol: data.details.currencyIn.currency.symbol,
          decimals: data.details.currencyIn.currency.decimals,
          chainId: data.details.currencyIn.currency.chainId,
        },
        outputToken: {
          address: data.details.currencyOut.currency.address,
          symbol: data.details.currencyOut.currency.symbol,
          decimals: data.details.currencyOut.currency.decimals,
          chainId: data.details.currencyOut.currency.chainId,
        },
      };

      return response;
    } catch (error) {
      if (error.response?.status === 400) {
        throw new BadRequestException(error.response.data.message || 'Invalid request');
      }
      throw new BadRequestException('Bridge service error: ', error.response.data.message);
    }
  }
}
