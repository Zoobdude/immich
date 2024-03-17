import { AssetSearchOptions, ReverseGeocodeResult, SearchExploreItem } from '@app/domain';
import { AssetEntity, AssetJobStatusEntity, AssetOrder, AssetType, ExifEntity } from '@app/infra/entities';
import { Prisma } from '@prisma/client';
import { Paginated, PaginationOptions } from '../domain.util';
export type AssetStats = Record<AssetType, number>;

export interface AssetStatsOptions {
  isFavorite?: boolean;
  isArchived?: boolean;
  isTrashed?: boolean;
}

export interface LivePhotoSearchOptions {
  ownerId: string;
  livePhotoCID: string;
  otherAssetId: string;
  type: AssetType;
}

export interface MapMarkerSearchOptions {
  isArchived?: boolean;
  isFavorite?: boolean;
  fileCreatedBefore?: Date;
  fileCreatedAfter?: Date;
}

export interface MapMarker extends ReverseGeocodeResult {
  id: string;
  lat: number;
  lon: number;
}

export enum WithoutProperty {
  THUMBNAIL = 'thumbnail',
  ENCODED_VIDEO = 'encoded-video',
  EXIF = 'exif',
  SMART_SEARCH = 'smart-search',
  OBJECT_TAGS = 'object-tags',
  FACES = 'faces',
  PERSON = 'person',
  SIDECAR = 'sidecar',
}

export enum WithProperty {
  SIDECAR = 'sidecar',
  IS_OFFLINE = 'isOffline',
}

export enum TimeBucketSize {
  DAY = 'DAY',
  MONTH = 'MONTH',
}

export interface AssetBuilderOptions {
  isArchived?: boolean;
  isFavorite?: boolean;
  isTrashed?: boolean;
  albumId?: string;
  personId?: string;
  userIds?: string[];
  withStacked?: boolean;
  exifInfo?: boolean;
  assetType?: AssetType;
}

export interface TimeBucketOptions extends AssetBuilderOptions {
  size: TimeBucketSize;
  order?: AssetOrder;
}

export interface TimeBucketItem {
  timeBucket: string;
  count: number;
}

// saving relations with AssetEntity is painful
export type AssetEntityWithoutRelations = {
  [K in keyof Omit<
    AssetEntity,
    | 'livePhotoVideo'
    | 'stack'
    | 'albums'
    | 'faces'
    | 'owner'
    | 'library'
    | 'exifInfo'
    | 'sharedLinks'
    | 'smartInfo'
    | 'smartSearch'
    | 'tags'
  >]: AssetEntity[K];
};

export type AssetCreate = Pick<
  AssetEntity,
  | 'deviceAssetId'
  | 'ownerId'
  | 'libraryId'
  | 'deviceId'
  | 'type'
  | 'originalPath'
  | 'fileCreatedAt'
  | 'localDateTime'
  | 'fileModifiedAt'
  | 'checksum'
  | 'originalFileName'
> &
  Partial<AssetEntityWithoutRelations>;

export interface MonthDay {
  day: number;
  month: number;
}

export interface AssetExploreFieldOptions {
  maxFields: number;
  minAssetsPerField: number;
}

export interface AssetExploreOptions extends AssetExploreFieldOptions {
  relation: keyof AssetEntity;
  relatedField: string;
  unnest?: boolean;
}

export interface MetadataSearchOptions {
  numResults: number;
}

export type AssetPathEntity = Pick<AssetEntity, 'id' | 'originalPath' | 'isOffline'>;

export const IAssetRepository = 'IAssetRepository';

export interface IAssetRepository {
  create(asset: AssetCreate): Promise<AssetEntity>;
  getByIds(ids: string[], relations?: Prisma.AssetsInclude): Promise<AssetEntity[]>;
  getByIdsWithAllRelations(ids: string[]): Promise<AssetEntity[]>;
  getByDayOfYear(ownerId: string, monthDay: MonthDay): Promise<AssetEntity[]>;
  getByChecksum(userId: string, checksum: Buffer): Promise<AssetEntity | null>;
  getByAlbumId(pagination: PaginationOptions, albumId: string): Paginated<AssetEntity>;
  getByUserId(pagination: PaginationOptions, userId: string, options?: AssetSearchOptions): Paginated<AssetEntity>;
  getById(id: string, relations?: Prisma.AssetsInclude): Promise<AssetEntity | null>;
  getWithout(pagination: PaginationOptions, property: WithoutProperty): Paginated<AssetEntity>;
  getWith(pagination: PaginationOptions, property: WithProperty, libraryId?: string): Paginated<AssetEntity>;
  getRandom(userId: string, count: number): Promise<AssetEntity[]>;
  getFirstAssetForAlbumId(albumId: string): Promise<AssetEntity | null>;
  getLastUpdatedAssetForAlbumId(albumId: string): Promise<AssetEntity | null>;
  getLibraryAssetPaths(pagination: PaginationOptions, libraryId: string): Paginated<AssetPathEntity>;
  getByLibraryIdAndOriginalPath(libraryId: string, originalPath: string): Promise<AssetEntity | null>;
  deleteAll(ownerId: string): Promise<void>;
  getAll(pagination: PaginationOptions, options?: AssetSearchOptions): Paginated<AssetEntity>;
  getAllByDeviceId(userId: string, deviceId: string): Promise<string[]>;
  updateAll(ids: string[], options: Partial<Omit<AssetEntity, 'id'>>): Promise<void>;
  save(asset: Pick<AssetEntity, 'id'> & Partial<AssetEntity>): Promise<AssetEntity>;
  remove(asset: AssetEntity): Promise<void>;
  softDeleteAll(ids: string[]): Promise<void>;
  restoreAll(ids: string[]): Promise<void>;
  findLivePhotoMatch(options: LivePhotoSearchOptions): Promise<AssetEntity | null>;
  getMapMarkers(ownerIds: string[], options?: MapMarkerSearchOptions): Promise<MapMarker[]>;
  getStatistics(ownerId: string, options: AssetStatsOptions): Promise<AssetStats>;
  getTimeBuckets(options: TimeBucketOptions): Promise<TimeBucketItem[]>;
  getTimeBucket(timeBucket: string, options: TimeBucketOptions): Promise<AssetEntity[]>;
  upsertExif(exif: Partial<ExifEntity>): Promise<void>;
  upsertJobStatus(jobStatus: Partial<AssetJobStatusEntity>): Promise<void>;
  getAssetIdByCity(userId: string, options: AssetExploreFieldOptions): Promise<SearchExploreItem<string>>;
  getAssetIdByTag(userId: string, options: AssetExploreFieldOptions): Promise<SearchExploreItem<string>>;
  searchMetadata(query: string, userIds: string[], options: MetadataSearchOptions): Promise<AssetEntity[]>;
}
