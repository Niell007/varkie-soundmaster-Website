/**
 * Extended Request interface with parameters from itty-router
 */
export interface RequestWithParams extends Request {
  /**
   * URL parameters from route matching
   */
  params: Record<string, string>;
  
  /**
   * Query parameters from URL
   */
  query: Record<string, string>;
  
  /**
   * Parse JSON body
   */
  json<T = any>(): Promise<T>;
}
