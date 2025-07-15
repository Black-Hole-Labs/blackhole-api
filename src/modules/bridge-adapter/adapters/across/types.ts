export interface AcrossRequest {
  /**
   * Address of token contract to transfer. For ETH (or other native tokens, like matic) use, use the wrapped address, like WETH.
   * Note: the address provided can be the token address on any chain.
   */
  token: string;

  /**
   * The intended destination of the transfer.
   */
  destinationChainId: number;

  /**
   * Amount of the token to transfer. Note: this amount is in the native decimals of the token.
   * So, for WETH, this would be the amount of human-readable WETH multiplied by 1e18.
   * For USDC, you would multiply the number of human-readable USDC by 1e6.
   */
  amount: string;

  /**
   * Used to specify which chain where the specified token address exists.
   * Note: this is only needed to disambiguate when there are matching addresses on different chains.
   * Otherwise, this can be inferred by the API.
   */
  originChainId?: number;

  /**
   * The recipient of the deposit. This can be an EOA or a contract.
   * If this is an EOA and message is defined, then the API will throw a 4xx error.
   */
  recipient?: string;

  /**
   * Specifies calldata that is passed to the recipient if recipient is a contract address.
   * This calldata is passed to the recipient via the recipient's handleAcrossMessage() public function.
   * The length of this value is constrained by the API to ~4096 chars minus the length of the full URL.
   */
  message?: string;

  /**
   * Optionally override the relayer address used to simulate the fillRelay() call that estimates the gas costs needed to fill a deposit.
   * This simulation result impacts the returned suggested-fees.
   * The reason to customize the EOA would be primarily if the recipientAddress is a contract and requires a certain relayer to submit the fill,
   * or if one specific relayer has the necessary token balance to make the fill.
   */
  relayer?: string;

  /**
   * The quote timestamp used to compute the LP fees.
   * When bridging with across, the user only specifies the quote timestamp in their transaction.
   * The relayer then determines the utilization at that timestamp to determine the user's fee.
   * This timestamp must be close (within 10 minutes or so) to the current time on the chain where the user is depositing funds
   * and it should be <= the current block timestamp on mainnet.
   * This allows the user to know exactly what LP fee they will pay before sending the transaction.
   * If this value isn't provided in the request, the API will assume the latest block timestamp on mainnet.
   */
  timestamp?: number;
}

interface Token {
  address: string;
  symbol: string;
  decimals: number;
  chainId: number;
}

interface Fee {
  pct: string;
  total: string;
}

interface Limits {
  minDeposit: string;
  maxDeposit: string;
  maxDepositInstant: string;
  maxDepositShortDelay: string;
  recommendedDepositInstant: string;
}

export interface AcrossResponse {
  estimatedFillTimeSec: number;
  capitalFeePct: string;
  capitalFeeTotal: string;
  relayGasFeePct: string;
  relayGasFeeTotal: string;
  relayFeePct: string;
  relayFeeTotal: string;
  lpFeePct: string;
  timestamp: string;
  isAmountTooLow: boolean;
  quoteBlock: string;
  exclusiveRelayer: string;
  exclusivityDeadline: number;
  spokePoolAddress: string;
  destinationSpokePoolAddress: string;
  totalRelayFee: Fee;
  relayerCapitalFee: Fee;
  relayerGasFee: Fee;
  lpFee: Fee;
  limits: Limits;
  fillDeadline: string;
  outputAmount: string;
  inputToken: Token;
  outputToken: Token;
}
