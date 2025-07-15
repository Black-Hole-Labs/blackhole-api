import { CHAIN_IDS } from '@shared-contracts/chainIds';
import { ethers } from 'ethers';

export class Utils {
  public static getProvider(chainId: CHAIN_IDS) {
    switch (chainId) {
      case CHAIN_IDS.BASE:
        return new ethers.providers.JsonRpcProvider(process.env.RPC_URL_BASE);
      case CHAIN_IDS.ARBITRUM:
        return new ethers.providers.JsonRpcProvider(process.env.RPC_URL_ARBITRUM);
    }
  }
  public static nativeToWrappedToken(chainId: CHAIN_IDS) {
    switch (chainId) {
      case CHAIN_IDS.BASE:
        return '0x4200000000000000000000000000000000000006';
      case CHAIN_IDS.ARBITRUM:
        return '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1';
      default:
        return '';
    }
  }
}
