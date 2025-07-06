import { Injectable, Query } from '@nestjs/common';
import { PathFinderService } from '../path-finder/path-finder.service';
import { QuoteRequestDto } from './dto/v1.dto';

@Injectable()
export class V1Service {
  constructor(private readonly pathFinderService: PathFinderService) {}

  getQuote(quote: QuoteRequestDto) {
    const path = this.pathFinderService.findBestPath(quote);
    // and other magic logic here

    return 'getQuote';
  }
}
