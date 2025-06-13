export interface BaseAdapter {
  getQuote(params: any): Promise<any>;

  // need to add more methods here
}
