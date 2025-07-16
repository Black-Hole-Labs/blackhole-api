import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';

export class QuoteRequestDto {
  @IsOptional()
  @IsString()
  senderAddress: string;

  @IsOptional()
  @IsString()
  receiverAddress: string;

  @IsNumber()
  originChainId: number;

  @IsNumber()
  destinationChainId: number;

  @IsString()
  amount: string;

  @IsString()
  originCurrency: string;

  @IsString()
  destinationCurrency: string;

  @IsEnum(['EXACT_INPUT', 'EXACT_OUTPUT'])
  tradeType: 'EXACT_INPUT' | 'EXACT_OUTPUT';
}
