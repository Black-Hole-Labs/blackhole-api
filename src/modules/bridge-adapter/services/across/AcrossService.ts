import { HttpService } from '@nestjs/axios';
import { BadRequestException } from '@nestjs/common';
import { BaseAdapter, QuoteParams, UnifiedQuoteResponse } from '../../interfaces/adapter-service.interface';
import { firstValueFrom } from 'rxjs';
import { AcrossRequest, AcrossResponse } from './types';

export class AcrossService implements BaseAdapter {
  acrossUrl = 'https://across.to/api';
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
    try {
      const reqParams: AcrossRequest = {
        token: originCurrency,
        destinationChainId,
        amount,
        originChainId,
        recipient: senderAddress,
      };
      const { data } = await firstValueFrom(
        this.httpService.get<AcrossResponse>(`${this.acrossUrl}/suggested-fees`, {
          params: reqParams,
        }),
      );
      console.log(data);
      const response: UnifiedQuoteResponse = {
        inputAmount: data.outputAmount,
        outputAmount: data.outputAmount,
        fees: [],
        inputToken: {
          address: data.inputToken.address,
          symbol: data.inputToken.symbol,
          decimals: data.inputToken.decimals,
          chainId: data.inputToken.chainId,
        },
        outputToken: {
          address: data.outputToken.address,
          symbol: data.outputToken.symbol,
          decimals: data.outputToken.decimals,
          chainId: data.outputToken.chainId,
        },
      };
      return response;
    } catch (error) {
      console.log(error.response);
      throw new BadRequestException('Bridge service error: ', error.response.data.message);
    }

    return {} as UnifiedQuoteResponse;
  }
}
