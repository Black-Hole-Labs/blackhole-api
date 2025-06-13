import { BaseAdapter } from '../interfaces/adapter-service.interface';

export class RelayService implements BaseAdapter {
  getQuote(params: any): Promise<any> {
    return Promise.resolve(params);
  }
}
