import { Controller, Get, Query } from '@nestjs/common';
import { V1Service } from './v1.service';
import { QuoteRequestDto } from './dto/v1.dto';

@Controller('v1')
export class V1Controller {
  constructor(private readonly v1Service: V1Service) {}

  @Get('quotes')
  getQuote(@Query() query: QuoteRequestDto) {
    return this.v1Service.getQuote(query);
  }
}
