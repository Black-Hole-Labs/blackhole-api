import { Injectable } from '@nestjs/common';
import { PathFinderService } from '../path-finder/path-finder.service';

@Injectable()
export class V1Service {
  constructor(private readonly pathFinderService: PathFinderService) {}

  getQuote() {
    const path = this.pathFinderService.findBestPath({});
    // and other magic logic here
    return 'getQuote';
  }
}
