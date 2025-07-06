import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AdaptersType } from './types/adapters.enum';
import { RelayService } from './services/relay/RelayService';
import { BaseAdapter } from './interfaces/adapter-service.interface';
import { AcrossService } from './services/across/AcrossService';

@Injectable()
export class BridgeAdapterService {
  public AdaptersMap: Map<AdaptersType, BaseAdapter> = new Map();
  public AdaptersArray: BaseAdapter[] = [];

  constructor(private readonly httpService: HttpService) {
    this.AdaptersMap.set(AdaptersType.ACROSS, new AcrossService(this.httpService));
    this.AdaptersMap.set(AdaptersType.RELAY, new RelayService(this.httpService));
    this.AdaptersArray = [new AcrossService(this.httpService), new RelayService(this.httpService)];
  }
}
