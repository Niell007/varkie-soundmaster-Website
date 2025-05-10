/**
 * User interface for authentication and user management
 */
export interface User {
  /**
   * Unique identifier for the user
   */
  id: string;
  
  /**
   * User's email address (used for login)
   */
  email: string;
  
  /**
   * User's display name
   */
  name: string;
  
  /**
   * User's password (hashed in a real application)
   */
  password: string;
  
  /**
   * User's role (admin, editor, etc.)
   */
  role: string;
  
  /**
   * Authentication token
   */
  token?: string;
  
  /**
   * When the user was created
   */
  createdAt?: string;
  
  /**
   * When the user was last updated
   */
  updatedAt?: string;
}
