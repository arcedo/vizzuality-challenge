export interface GetEmissionsQuery {
  value?: {
    gte?: string | number;
    lte?: string | number;
    eq?: string | number;
  };
  country?: string;
  year?: {
    gte?: number;
    lte?: number;
  };
  page?: number;
  pageSize?: number;
  [key: string]: any;
}
