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
}
