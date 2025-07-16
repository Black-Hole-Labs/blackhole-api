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
import { PublicKey } from '@solana/web3.js';
import { NON_EVM_ADDRESS } from 'src/utils/constants';

@Injectable()
export class RelayAdapter implements BaseAdapter {
  relayUrl = 'https://api.relay.link'; // TODO: move to env

  constructor(private readonly httpService: HttpService) {}

  async getQuote(params: QuoteParams) {
    try {
      const body = {
        user: params.senderAddress,
        originChainId: params.originChainId,
        destinationChainId: params.destinationChainId,
        originCurrency: params.originCurrency,
        destinationCurrency: params.destinationCurrency,
        amount: params.amount,
        recipient: params.receiverAddress,
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
      const destTokenNative = params.destinationCurrency === '0x0000000000000000000000000000000000000000';
      const destChainSolana = params.destinationChainId === 792703809;

      const { data: quoteData } = await firstValueFrom(
        this.httpService.post<RelayQuoteResponse>(`${this.relayUrl}/quote`, quoteBody),
      );

      const requestId = quoteData.steps[0].requestId;

      const { data: signatureData } = await firstValueFrom(
        this.httpService.get(`${this.relayUrl}/requests/${requestId}/signature/v2`),
      );

      // Этап 3: Формирование каллдаты с encodeFunctionData

      const bridgeData = {
        transactionId: ethers.utils.randomBytes(32),
        bridge: 'Relay',
        integrator: 'ACME Devs',
        referrer: '0x0000000000000000000000000000000000000000',
        sendingAssetId: params.originCurrency,
        receiver: destChainSolana ? NON_EVM_ADDRESS : params.receiverAddress,
        minAmount: params.amount,
        destinationChainId: params.destinationChainId,
        hasSourceSwaps: false,
        hasDestinationCall: false,
      };

      // Формируем RelayData

      let _receivingAssetId = constants.HashZero;

      if (!destTokenNative && !destChainSolana) {
        _receivingAssetId = utils.hexZeroPad(params.destinationCurrency, 32);
      }
      let _nonEVMReceiver = ethers.constants.HashZero;
      if (destChainSolana) {
        _receivingAssetId = `0x${new PublicKey(params.destinationCurrency).toBuffer().toString('hex')}`;
        _nonEVMReceiver = `0x${new PublicKey(params.receiverAddress).toBuffer().toString('hex')}`;
      }

      const relayData = {
        requestId,
        nonEVMReceiver: _nonEVMReceiver,
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
      console.log('Relay adapter failed:', error.message);
      if (error.response?.status === 400) {
        throw new BadRequestException(error.response.data.message || 'Invalid request');
      }
      throw new InternalServerErrorException('Failed to generate calldata: ' + error.message);
    }
  }
}

/**
 * 
 * const RPC_URL = process.env.ETH_NODE_URI_BASE
  const PRIVATE_KEY = process.env.PRIVATE_KEY
  const LIFI_ADDRESS = deployments.LiFiDiamond

  const provider = new ethers.providers.JsonRpcProvider(RPC_URL)
  const signer = new ethers.Wallet(PRIVATE_KEY as string, provider)
  const relay = RelayFacet__factory.connect(LIFI_ADDRESS, provider)

  const address = await signer.getAddress()
  console.log('Address: ', address)
  let tx

  // Bridge ETH
  const eth_bridge_amount = ethers.utils.parseEther('0.0001')

  let params = {
    user: deployments.LiFiDiamond,
    originChainId: CHAIN_IDS.BASE,
    destinationChainId: CHAIN_IDS.ARBITRUM,
    originCurrency: '0x0000000000000000000000000000000000000000',
    destinationCurrency: '0x0000000000000000000000000000000000000000',
    recipient: address,
    tradeType: 'EXACT_INPUT',
    amount: eth_bridge_amount.toString(),
    referrer: 'relay.link/swap',
    useExternalLiquidity: false,
  }

  let resp = await fetch('https://api.relay.link/quote', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  })
  let quote = await resp.json()
  let requestId = quote.steps[0].requestId

  let sigResp = await fetch(
    `https://api.relay.link/requests/${requestId}/signature/v2`,
    { headers: { 'Content-Type': 'application/json' } }
  )
  let sigData = await sigResp.json()

  let bridgeData: ILiFi.BridgeDataStruct = {
    transactionId: utils.randomBytes(32),
    bridge: 'Relay',
    integrator: 'ACME Devs',
    referrer: '0x0000000000000000000000000000000000000000',
    sendingAssetId: '0x0000000000000000000000000000000000000000',
    receiver: address,
    minAmount: eth_bridge_amount,
    destinationChainId: CHAIN_IDS.ARBITRUM,
    hasSourceSwaps: false,
    hasDestinationCall: false,
  }

  let relayData: RelayFacet.RelayDataStruct = {
    requestId,
    nonEVMReceiver: ethers.constants.HashZero,
    receivingAssetId: ethers.constants.HashZero,
    signature: sigData.signature,
  }

  console.info('Dev Wallet Address: ', address)
  console.info('Bridging ETH...')
  tx = await relay
    .connect(signer)
    .startBridgeTokensViaRelay(bridgeData, relayData, {
      value: eth_bridge_amount,
    })
  await tx.wait()
  console.info('Bridged ETH')

 */
