import { HttpService } from '@nestjs/axios';
import { BadRequestException } from '@nestjs/common';
import { BaseAdapter, QuoteParams, UnifiedQuoteResponse } from '../../interfaces/adapter-service.interface';
import { firstValueFrom } from 'rxjs';
import { AcrossRequest, AcrossResponse } from './types';
import { AdaptersType } from '@modules/bridge-adapter/types/adapters.enum';
import { CHAIN_IDS } from '@shared-contracts/chainIds';
import { LiFiDiamond } from '@shared-contracts/deployments/base.staging.json';
import { Utils } from 'src/utils/utils';
import { AcrossFacetV3, AcrossFacetV3__factory, ILiFi } from '@shared-contracts/typechain';
import { BigNumber, constants, utils } from 'ethers';

export class AcrossAdapter implements BaseAdapter {
  acrossUrl = 'https://across.to/api';
  constructor(private readonly httpService: HttpService) {}

  public async getQuote({
    originChainId,
    destinationChainId,
    amount,
    originCurrency,
    destinationCurrency,
    senderAddress,
    receiverAddress,
  }: QuoteParams) {
    // across does not understand native token. Need to use WETH and etc
    let _originCurrency = originCurrency;
    let _destinationCurrency = destinationCurrency;

    if (originCurrency === '0x0000000000000000000000000000000000000000') {
      _originCurrency = Utils.nativeToWrappedToken(originChainId);
    }
    if (destinationCurrency === '0x0000000000000000000000000000000000000000') {
      _destinationCurrency = Utils.nativeToWrappedToken(destinationChainId);
    }

    try {
      const reqParams: AcrossRequest = {
        token: _originCurrency,
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

      const response: UnifiedQuoteResponse = {
        metaData: {
          adapter: AdaptersType.ACROSS,
        },
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
        timestamp: Number(data.timestamp),
      };
      return response;
    } catch (error) {
      throw new BadRequestException('Bridge service error: ', error.response.data.message);
    }
  }

  public async generateCalldata(params: QuoteParams, quote?: UnifiedQuoteResponse) {
    if (!quote) {
      throw new BadRequestException('[Across adapter]: Quote is required');
    }

    const liFiDiamondAddress = '0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE';
    // const liFiDiamondAddress = LiFiDiamond;

    const provider = Utils.getProvider(params.originChainId);
    const acrossV3Facet = AcrossFacetV3__factory.connect(liFiDiamondAddress, provider);

    const bridgeData: ILiFi.BridgeDataStruct = {
      transactionId: utils.randomBytes(32),
      bridge: 'acrossV3',
      integrator: 'demoScript',
      referrer: '0x0000000000000000000000000000000000000000',
      sendingAssetId: params.originCurrency,
      receiver: params.senderAddress,
      minAmount: params.amount,
      destinationChainId: params.destinationChainId,
      hasSourceSwaps: false,
      hasDestinationCall: false,
    };

    let payload = '0x';
    const acrossV3Data: AcrossFacetV3.AcrossV3DataStruct = {
      receivingAssetId: quote.outputToken.address,
      outputAmount: quote.outputAmount,
      outputAmountPercent: 0,
      quoteTimestamp: quote.timestamp,
      fillDeadline: quote.timestamp + 60 * 60, // 60 minutes from now
      message: payload,
      receiverAddress: params.receiverAddress,
      refundAddress: params.receiverAddress,
      exclusiveRelayer: constants.AddressZero,
      exclusivityDeadline: 0,
    };

    console.log('acrossV3Data: ', acrossV3Data);
    console.log('bridgeData: ', bridgeData);

    // startBridgeTokensViaAcrossV3 юзается если не требуются свапы до бриджа.
    const calldata = acrossV3Facet.interface.encodeFunctionData('startBridgeTokensViaAcrossV3', [
      bridgeData,
      acrossV3Data,
    ]);
    const value = params.originCurrency === constants.AddressZero ? params.amount : '0';
    return {
      to: liFiDiamondAddress,
      value: value,
      data: calldata,
    };
  }
}
