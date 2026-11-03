export interface DocumentItemDto {
  id: string;
  name: string;
  category: string;
  relatedEntity: string;
  size: string;
  fileSizeBytes: number;
  mimeType: string;
  uploadedAt: string;
  uploader: string;
  storagePath: string;
}

export interface RegisterFileInput {
  originalName: string;
  mimeType: string;
  fileSizeBytes: number;
  category: string;
  relatedEntity?: string;
  villageId?: string;
  checksumSha256?: string;
  personId?: string;
  houseId?: string;
  notes?: string;
}
