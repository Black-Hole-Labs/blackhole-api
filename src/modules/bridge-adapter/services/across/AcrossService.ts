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
      throw new BadRequestException('Bridge service error: ', error.response.data.message);
    }
  }
}

/* example of calldata encoding */

// const PoolV3_ABI = [
//   "function depositV3(address refundAddress,address recipient,address inputToken,address outputToken,uint256 inputAmount,uint256 outputAmount,uint256 destinationChainId,address exclusiveRelayer,uint32 quoteTimestamp,uint32 fillDeadline,uint32 exclusivityDeadline,bytes message)"
// ];

// const iface = new ethers.utils.Interface(PoolV3_ABI);

// const args = [
//   params.senderAddress,           // refundAddress
//   params.receiverAddress,         // recipient
//   data.inputToken.address,        // inputToken
//   data.outputToken.address,       // outputToken
//   ethers.BigNumber.from(params.amount),      // inputAmount
//   ethers.BigNumber.from(data.outputAmount),  // outputAmount
//   params.destinationChainId,      // destinationChainId
//   data.exclusiveRelayer,          // exclusiveRelayer
//   Number(data.timestamp),         / quoteTimestamp
//   Number(data.fillDeadline),      // fillDeadline
//   data.exclusivityDeadline,       // exclusivityDeadline
//   "0x",                           // message (empty of no destination call)
// ];

// const calldata = iface.encodeFunctionData("depositV3", args);


/* use CALLDATA to send tx (for user) */

// const provider = new ethers.providers.JsonRpcProvider(YOUR_RPC_URL)
// const signer = provider.getSigner()

// const tx = await signer.sendTransaction({
//   to: data.spokePoolAddress,
//   data: calldata,
//   value: ethers.BigNumber.from(
//     params.isNative ? params.amount : "0"
//   ),
// });