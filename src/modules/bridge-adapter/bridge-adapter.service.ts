import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AdaptersType } from './types/adapters.enum';
import { RelayService } from './services/relay/RelayService';
import { BaseAdapter } from './interfaces/adapter-service.interface';
import { AcrossService } from './services/across/AcrossService';

@Injectable()
export class BridgeAdapterService {
  // mb it should be array, not map
  public AdaptersMap: Map<AdaptersType, BaseAdapter> = new Map();

  constructor(private readonly httpService: HttpService) {
    this.AdaptersMap.set(AdaptersType.ACROSS, new AcrossService(this.httpService));
    this.AdaptersMap.set(AdaptersType.RELAY, new RelayService(this.httpService));
  }
}
