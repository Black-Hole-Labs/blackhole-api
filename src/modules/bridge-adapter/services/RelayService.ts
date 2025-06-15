import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { BaseAdapter, QuoteParams, UnifiedQuoteResponse } from '../interfaces/adapter-service.interface';
import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class RelayService implements BaseAdapter {
  relayUrl = 'https://api.relay.link';
  constructor(private readonly httpService: HttpService) {}

  async getQuote(params: QuoteParams) {
    try {
      const body = { ...params, useReceiver: true, user: params.walletAddress };
      console.log(body);
      const { data } = await firstValueFrom(
        this.httpService.post(`${this.relayUrl}/quote`, {
          body,
        }),
      );

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
      if (error.response?.status === 400) {
        throw new BadRequestException(error.response.data.message || 'Invalid request');
      }
      throw new InternalServerErrorException('Bridge service error');
    }
  }
}
