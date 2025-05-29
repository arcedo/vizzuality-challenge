import { EmissionWithSector } from "../../domain/EmissionWithSector";
export interface PaginationMetadata {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface GetEmissionsResponse {
  emissions: EmissionWithSector[];
  pagination: PaginationMetadata;
}
