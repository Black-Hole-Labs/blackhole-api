interface Currency {
  chainId: number;
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  metadata: {
    logoURI: string;
    verified: boolean;
  };
}

interface Amount {
  currency: Currency;
  amount: string;
  amountFormatted: string;
  amountUsd: string;
  minimumAmount: string;
}

interface TransactionData {
  from: string;
  to: string;
  data: string;
  value: string;
  chainId: number;
  maxFeePerGas: string;
  maxPriorityFeePerGas: string;
}

interface Check {
  endpoint: string;
  method: string;
}

interface TransactionItem {
  status: string;
  data: TransactionData;
  check: Check;
}

interface Step {
  id: string;
  action: string;
  description: string;
  kind: string;
  items: TransactionItem[];
  requestId: string;
  depositAddress: string;
}

interface Fees {
  gas: Amount;
  relayer: Amount;
  relayerGas: Amount;
  relayerService: Amount;
  app: Amount;
}

interface Impact {
  usd: string;
  percent: string;
}

interface SlippageTolerance {
  origin: {
    usd: string;
    value: string;
    percent: string;
  };
  destination: {
    usd: string;
    value: string;
    percent: string;
  };
}

interface Details {
  operation: string;
  sender: string;
  recipient: string;
  currencyIn: Amount;
  currencyOut: Amount;
  totalImpact: Impact;
  swapImpact: Impact;
  rate: string;
  slippageTolerance: SlippageTolerance;
  timeEstimate: number;
  userBalance: string;
}

export interface RelayQuoteResponse {
  steps: Step[];
  fees: Fees;
  details: Details;
}
