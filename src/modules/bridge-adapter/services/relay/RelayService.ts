import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { BaseAdapter, QuoteParams, UnifiedQuoteResponse } from '../../interfaces/adapter-service.interface';
import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { RelayQuoteResponse } from './types';
import { AdaptersType } from '@modules/bridge-adapter/types/adapters.enum';
import { RelayFacet__factory } from '@shared-contracts/typechain/factories/RelayFacet__factory';
import { constants, ethers, utils } from 'ethers';
import { LiFiDiamond } from '@shared-contracts/deployments/base.staging.json';
import { CHAIN_IDS } from '@shared-contracts/chainIds';
import { Utils } from 'src/utils/utils';

@Injectable()
export class RelayService implements BaseAdapter {
  relayUrl = 'https://api.relay.link'; // TODO: move to env

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
      console.log('Relay adapter failed:', error.message);
      console.log('error: ', error.response.data);

      return null;
    }
  }

  async generateCalldata(params: QuoteParams) {
    try {
      const provider = Utils.getProvider(params.originChainId);

      const liFiDiamond = '0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE';
      // const liFiDiamond = LiFiDiamond;
      const relayFacet = RelayFacet__factory.connect(liFiDiamond, provider);

      const quoteBody = {
        user: liFiDiamond,
        recipient: params.receiverAddress,
        originChainId: params.originChainId,
        destinationChainId: params.destinationChainId,
        originCurrency: params.originCurrency,
        destinationCurrency: params.destinationCurrency,
        amount: params.amount,
        tradeType: params.tradeType,
        referrer: 'relay.link/swap',
        useExternalLiquidity: false,
      };

      const { data: quoteData } = await firstValueFrom(
        this.httpService.post<RelayQuoteResponse>(`${this.relayUrl}/quote`, quoteBody),
      );

      const requestId = quoteData.steps[0].requestId;

      const { data: signatureData } = await firstValueFrom(
        this.httpService.get(`${this.relayUrl}/requests/${requestId}/signature/v2`),
      );

      const bridgeData = {
        transactionId: ethers.utils.randomBytes(32),
        bridge: 'Relay',
        integrator: 'ACME Devs',
        referrer: '0x0000000000000000000000000000000000000000',
        sendingAssetId: params.originCurrency,
        receiver: params.receiverAddress || params.senderAddress,
        minAmount: params.amount,
        destinationChainId: params.destinationChainId,
        hasSourceSwaps: false,
        hasDestinationCall: false,
      };

      let _receivingAssetId = constants.HashZero;
      if (params.destinationCurrency !== '0x0000000000000000000000000000000000000000') {
        _receivingAssetId = utils.hexZeroPad(params.destinationCurrency, 32);
      }
      const relayData = {
        requestId,
        nonEVMReceiver: ethers.constants.HashZero,
        receivingAssetId: _receivingAssetId,
        signature: signatureData.signature,
      };

      const calldata = relayFacet.interface.encodeFunctionData('startBridgeTokensViaRelay', [bridgeData, relayData]);

      return {
        to: liFiDiamond,
        value: params.originCurrency === '0x0000000000000000000000000000000000000000' ? params.amount : '0',
        data: calldata,
      };
    } catch (error) {
      if (error.response?.status === 400) {
        throw new BadRequestException(error.response.data.message || 'Invalid request');
      }
      throw new InternalServerErrorException('Failed to generate calldata: ' + error.message);
    }
  }
}
