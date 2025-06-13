import { BaseAdapter } from '../interfaces/adapter-service.interface';

export class AcrossService implements BaseAdapter {
  getQuote(params: any): Promise<any> {
    return Promise.resolve(params);
  }
}
