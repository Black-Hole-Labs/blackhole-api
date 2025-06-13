import { Injectable } from '@nestjs/common';
import { BridgeAdapterService } from '../bridge-adapter/bridge-adapter.service';

@Injectable()
export class PathFinderService {
  constructor(private readonly bridgeAdapterService: BridgeAdapterService) {}

  async findBestPath(params: any) {
    // some magic here
  }
}
