import { Injectable } from '@nestjs/common';
import { AdaptersType } from './types/adapters.enum';
import { RelayService } from './services/RelayService';
import { BaseAdapter } from './interfaces/adapter-service.interface';
import { AcrossService } from './services/AcrossService';

@Injectable()
export class BridgeAdapterService {
  // mb it should be array, not map
  public AdaptersMap: Map<AdaptersType, BaseAdapter> = new Map();

  constructor() {
    // will be change later
    this.AdaptersMap.set(AdaptersType.ACROSS, new AcrossService());
    this.AdaptersMap.set(AdaptersType.RELAY, new RelayService());
  }
}
