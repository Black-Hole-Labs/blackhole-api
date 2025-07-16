import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AdaptersType } from './types/adapters.enum';
import { RelayAdapter } from './adapters/relay/RelayAdapter';
import { BaseAdapter } from './interfaces/adapter-service.interface';
import { AcrossAdapter } from './adapters/across/AcrossAdapter';

@Injectable()
export class BridgeAdapterService {
  public AdaptersMap: Map<AdaptersType, BaseAdapter> = new Map();
  // public AdaptersArray: BaseAdapter[] = [];

  constructor(private readonly httpService: HttpService) {
    // this.AdaptersMap.set(AdaptersType.ACROSS, new AcrossAdapter(this.httpService));
    this.AdaptersMap.set(AdaptersType.RELAY, new RelayAdapter(this.httpService));
  }

  getAdapterArray() {
    return Array.from(this.AdaptersMap.values());
  }
}
