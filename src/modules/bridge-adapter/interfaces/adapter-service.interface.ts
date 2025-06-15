export interface QuoteParams {
  originChainId: number;
  destinationChainId: number;
  amount: string;
  originCurrency: string;
  destinationCurrency: string;
}

export interface QuoteFee {
  type: 'gas' | 'relayer' | 'relayerGas' | 'relayerService' | 'capital' | 'lp' | 'app' | 'total'; // TODO: check this
  amount: string;
  amountFormatted?: string;
  amountUsd?: string;
  percent?: string;
  currencySymbol: string;
  currencyAddress: string;
  chainId: number;
}

export interface QuoteTokenInfo {
  address: string;
  symbol: string;
  decimals: number;
  chainId: number;
}

export interface UnifiedQuoteResponse {
  inputAmount: string;
  outputAmount: string;
  rate?: string;
  estimatedTimeSec?: number;
  requestId?: string;
  isAmountTooLow?: boolean;
  fees: QuoteFee[];
  inputToken: QuoteTokenInfo;
  outputToken: QuoteTokenInfo;
}

export interface BaseAdapter {
  getQuote(params: QuoteParams): Promise<UnifiedQuoteResponse>;

  // need to add more methods here
}
