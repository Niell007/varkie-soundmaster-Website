/**
 * Environment variables and bindings for the Cloudflare Worker
 */
export interface Env {
  /**
   * D1 database binding
   */
  DB: D1Database;
  
  /**
   * R2 storage binding for media files
   */
  R2: R2Bucket;
  
  /**
   * R2 storage binding specifically for media library
   */
  MEDIA_BUCKET: R2Bucket;
  
  /**
   * KV namespace for admin assets
   */
  ADMIN_ASSETS: KVNamespace;
  
  /**
   * JWT secret for authentication
   */
  JWT_SECRET: string;
  
  /**
   * Admin email for initial setup
   */
  ADMIN_EMAIL: string;
}

/**
 * D1 database interface
 */
interface D1Database {
  prepare(query: string): D1PreparedStatement;
  dump(): Promise<ArrayBuffer>;
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
  exec<T = unknown>(query: string): Promise<D1Result<T>>;
}

/**
 * D1 prepared statement interface
 */
interface D1PreparedStatement {
  bind(...values: any[]): D1PreparedStatement;
  first<T = unknown>(colName?: string): Promise<T | null>;
  run<T = unknown>(): Promise<D1Result<T>>;
  all<T = unknown>(): Promise<D1Result<T>>;
  raw<T = unknown>(): Promise<T[]>;
}

/**
 * D1 query result interface
 */
interface D1Result<T = unknown> {
  results?: T[];
  success: boolean;
  error?: string;
  meta?: object;
}

/**
 * R2 bucket interface
 */
interface R2Bucket {
  head(key: string): Promise<R2Object | null>;
  get(key: string, options?: R2GetOptions): Promise<R2ObjectBody | null>;
  put(key: string, value: ReadableStream | ArrayBuffer | string, options?: R2PutOptions): Promise<R2Object>;
  delete(key: string): Promise<void>;
  list(options?: R2ListOptions): Promise<R2Objects>;
}

/**
 * R2 object interface
 */
interface R2Object {
  key: string;
  version: string;
  size: number;
  etag: string;
  httpEtag: string;
  checksums: R2Checksums;
  uploaded: Date;
  httpMetadata?: R2HttpMetadata;
  customMetadata?: Record<string, string>;
}

/**
 * R2 object body interface
 */
interface R2ObjectBody extends R2Object {
  body: ReadableStream;
  bodyUsed: boolean;
  arrayBuffer(): Promise<ArrayBuffer>;
  text(): Promise<string>;
  json<T>(): Promise<T>;
  blob(): Promise<Blob>;
}

/**
 * R2 checksums interface
 */
interface R2Checksums {
  md5?: string;
  sha1?: string;
  sha256?: string;
  sha384?: string;
  sha512?: string;
}

/**
 * R2 HTTP metadata interface
 */
interface R2HttpMetadata {
  contentType?: string;
  contentLanguage?: string;
  contentDisposition?: string;
  contentEncoding?: string;
  cacheControl?: string;
  cacheExpiry?: Date;
}

/**
 * R2 get options interface
 */
interface R2GetOptions {
  onlyIf?: R2Conditional;
  range?: R2Range;
}

/**
 * R2 put options interface
 */
interface R2PutOptions {
  httpMetadata?: R2HttpMetadata;
  customMetadata?: Record<string, string>;
  md5?: string;
  sha1?: string;
  sha256?: string;
  sha384?: string;
  sha512?: string;
}

/**
 * R2 list options interface
 */
interface R2ListOptions {
  limit?: number;
  prefix?: string;
  cursor?: string;
  delimiter?: string;
  include?: string[];
}

/**
 * R2 objects interface
 */
interface R2Objects {
  objects: R2Object[];
  truncated: boolean;
  cursor?: string;
  delimitedPrefixes?: string[];
}

/**
 * R2 conditional interface
 */
interface R2Conditional {
  etagMatches?: string;
  etagDoesNotMatch?: string;
  uploadedBefore?: Date;
  uploadedAfter?: Date;
}

/**
 * R2 range interface
 */
interface R2Range {
  offset?: number;
  length?: number;
  suffix?: number;
}

/**
 * KV namespace interface
 */
interface KVNamespace {
  get(key: string, options?: KVNamespaceGetOptions): Promise<string | null>;
  get(key: string, type: 'text', options?: KVNamespaceGetOptions): Promise<string | null>;
  get<T>(key: string, type: 'json', options?: KVNamespaceGetOptions): Promise<T | null>;
  get(key: string, type: 'arrayBuffer', options?: KVNamespaceGetOptions): Promise<ArrayBuffer | null>;
  get(key: string, type: 'stream', options?: KVNamespaceGetOptions): Promise<ReadableStream | null>;
  put(key: string, value: string | ReadableStream | ArrayBuffer, options?: KVNamespacePutOptions): Promise<void>;
  delete(key: string): Promise<void>;
  list(options?: KVNamespaceListOptions): Promise<KVNamespaceListResult>;
}

/**
 * KV namespace get options interface
 */
interface KVNamespaceGetOptions {
  type?: 'text' | 'json' | 'arrayBuffer' | 'stream';
  cacheTtl?: number;
}

/**
 * KV namespace put options interface
 */
interface KVNamespacePutOptions {
  expiration?: number;
  expirationTtl?: number;
  metadata?: any;
}

/**
 * KV namespace list options interface
 */
interface KVNamespaceListOptions {
  prefix?: string;
  limit?: number;
  cursor?: string;
}

/**
 * KV namespace list result interface
 */
interface KVNamespaceListResult {
  keys: KVNamespaceListKey[];
  list_complete: boolean;
  cursor?: string;
}

/**
 * KV namespace list key interface
 */
interface KVNamespaceListKey {
  name: string;
  expiration?: number;
  metadata?: any;
}
