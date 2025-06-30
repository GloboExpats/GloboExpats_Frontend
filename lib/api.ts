/**
 * API Client for GlobalExpat Platform
 *
 * Centralized API client for communicating with the backend services.
 * Provides type-safe methods for all API endpoints with proper error handling,
 * authentication, and response processing.
 *
 * @example Basic usage:
 * ```tsx
 * import { api } from '@/lib/api'
 *
 * // Fetch products
 * const products = await api.products.list({ category: 'electronics' })
 *
 * // Get single product
 * const product = await api.products.get('product-id')
 * ```
 */

// ============================================================================
// CONFIGURATION & TYPES
// ============================================================================

/** Base API URL from environment or fallback */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

/**
 * Standard API response wrapper
 * @template T - The type of the response data
 */
interface ApiResponse<T> {
  /** Response data */
  data: T
  /** Whether the request was successful */
  success: boolean
  /** Optional success/error message */
  message?: string
  /** Array of validation or other errors */
  errors?: string[]
}

/**
 * Product list query parameters
 */
interface ProductListParams {
  /** Filter by category slug */
  category?: string
  /** Page number for pagination */
  page?: number
  /** Number of items per page */
  limit?: number
  /** Search query string */
  search?: string
}

// ============================================================================
// API CLIENT CLASS
// ============================================================================

/**
 * Main API client class handling HTTP requests and authentication
 */
class ApiClient {
  private baseURL: string
  private headers: HeadersInit

  constructor() {
    this.baseURL = API_BASE_URL
    this.headers = {
      'Content-Type': 'application/json',
    }
  }

  /**
   * Sets the authentication token for subsequent requests
   * @param token - JWT token for authentication
   */
  setAuthToken(token: string): void {
    this.headers = {
      ...this.headers,
      Authorization: `Bearer ${token}`,
    }
  }

  /**
   * Removes the authentication token
   */
  clearAuthToken(): void {
    const { Authorization, ...headersWithoutAuth } = this.headers as any
    this.headers = headersWithoutAuth
  }

  /**
   * Makes an HTTP request to the API
   * @param endpoint - API endpoint path
   * @param options - Fetch options (method, body, etc.)
   * @returns Promise resolving to API response
   */
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`

    try {
      const response = await fetch(url, {
        headers: this.headers,
        ...options,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  // ============================================================================
  // PRODUCT ENDPOINTS
  // ============================================================================

  /**
   * Fetches a list of products with optional filtering
   * @param params - Query parameters for filtering and pagination
   * @returns Promise resolving to products list
   */
  async getProducts(params?: ProductListParams): Promise<ApiResponse<any>> {
    let queryString = ''
    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
      queryString = searchParams.toString() ? `?${searchParams.toString()}` : ''
    }
    return this.request(`/products${queryString}`)
  }

  /**
   * Fetches a single product by ID
   * @param id - Product identifier
   * @returns Promise resolving to product data
   */
  async getProduct(id: string): Promise<ApiResponse<any>> {
    return this.request(`/products/${id}`)
  }

  /**
   * Creates a new product listing
   * @param productData - Product information
   * @returns Promise resolving to created product
   */
  async createProduct(productData: any): Promise<ApiResponse<any>> {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    })
  }

  /**
   * Updates an existing product
   * @param id - Product identifier
   * @param productData - Updated product information
   * @returns Promise resolving to updated product
   */
  async updateProduct(id: string, productData: any): Promise<ApiResponse<any>> {
    return this.request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    })
  }

  /**
   * Deletes a product listing
   * @param id - Product identifier
   * @returns Promise resolving to deletion confirmation
   */
  async deleteProduct(id: string): Promise<ApiResponse<any>> {
    return this.request(`/products/${id}`, {
      method: 'DELETE',
    })
  }

  // ============================================================================
  // USER ENDPOINTS
  // ============================================================================

  /**
   * Fetches user profile information
   * @param id - User identifier
   * @returns Promise resolving to user data
   */
  async getUser(id: string): Promise<ApiResponse<any>> {
    return this.request(`/users/${id}`)
  }

  /**
   * Updates user profile information
   * @param id - User identifier
   * @param data - Updated user data
   * @returns Promise resolving to updated user
   */
  async updateUser(id: string, data: Partial<any>): Promise<ApiResponse<any>> {
    return this.request(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  // ============================================================================
  // AUTHENTICATION ENDPOINTS
  // ============================================================================

  /**
   * Authenticates user with email and password
   * @param email - User email address
   * @param password - User password
   * @returns Promise resolving to authentication data
   */
  async login(email: string, password: string): Promise<ApiResponse<any>> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  /**
   * Registers a new user account
   * @param userData - User registration data
   * @returns Promise resolving to registration result
   */
  async register(userData: any): Promise<ApiResponse<any>> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  /**
   * Initiates password reset process
   * @param email - User email address
   * @returns Promise resolving to reset confirmation
   */
  async resetPassword(email: string): Promise<ApiResponse<any>> {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  }

  /**
   * Logs out the current user
   * @returns Promise resolving to logout confirmation
   */
  async logout(): Promise<ApiResponse<any>> {
    return this.request('/auth/logout', {
      method: 'POST',
    })
  }

  // ============================================================================
  // MESSAGING ENDPOINTS
  // ============================================================================

  /**
   * Fetches user's conversation list
   * @returns Promise resolving to conversations
   */
  async getConversations(): Promise<ApiResponse<any>> {
    return this.request('/messages/conversations')
  }

  /**
   * Fetches messages for a specific conversation
   * @param conversationId - Conversation identifier
   * @returns Promise resolving to messages
   */
  async getMessages(conversationId: string): Promise<ApiResponse<any>> {
    return this.request(`/messages/conversations/${conversationId}`)
  }

  /**
   * Sends a message in a conversation
   * @param conversationId - Conversation identifier
   * @param message - Message content
   * @returns Promise resolving to sent message
   */
  async sendMessage(conversationId: string, message: string): Promise<ApiResponse<any>> {
    return this.request(`/messages/conversations/${conversationId}`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    })
  }

  /**
   * Creates a new conversation
   * @param recipientId - ID of the message recipient
   * @param initialMessage - First message content
   * @returns Promise resolving to new conversation
   */
  async createConversation(recipientId: string, initialMessage: string): Promise<ApiResponse<any>> {
    return this.request('/messages/conversations', {
      method: 'POST',
      body: JSON.stringify({ recipientId, message: initialMessage }),
    })
  }

  // ============================================================================
  // ORDER ENDPOINTS
  // ============================================================================

  /**
   * Fetches user's order history
   * @returns Promise resolving to orders list
   */
  async getOrders(): Promise<ApiResponse<any>> {
    return this.request('/orders')
  }

  /**
   * Creates a new order
   * @param orderData - Order information
   * @returns Promise resolving to created order
   */
  async createOrder(orderData: any): Promise<ApiResponse<any>> {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    })
  }

  /**
   * Fetches details for a specific order
   * @param orderId - Order identifier
   * @returns Promise resolving to order details
   */
  async getOrder(orderId: string): Promise<ApiResponse<any>> {
    return this.request(`/orders/${orderId}`)
  }

  /**
   * Updates order status
   * @param orderId - Order identifier
   * @param status - New order status
   * @returns Promise resolving to updated order
   */
  async updateOrderStatus(orderId: string, status: string): Promise<ApiResponse<any>> {
    return this.request(`/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
  }
}

// ============================================================================
// SINGLETON INSTANCE & EXPORTS
// ============================================================================

/** Singleton API client instance */
export const apiClient = new ApiClient()

/**
 * Organized API methods for easy consumption
 * Groups related endpoints together for better developer experience
 */
export const api = {
  /** Product-related operations */
  products: {
    list: (params?: ProductListParams) => apiClient.getProducts(params),
    get: (id: string) => apiClient.getProduct(id),
    create: (data: any) => apiClient.createProduct(data),
    update: (id: string, data: any) => apiClient.updateProduct(id, data),
    delete: (id: string) => apiClient.deleteProduct(id),
  },

  /** User management operations */
  users: {
    get: (id: string) => apiClient.getUser(id),
    update: (id: string, data: any) => apiClient.updateUser(id, data),
  },

  /** Authentication operations */
  auth: {
    login: (email: string, password: string) => apiClient.login(email, password),
    register: (userData: any) => apiClient.register(userData),
    resetPassword: (email: string) => apiClient.resetPassword(email),
    logout: () => apiClient.logout(),
  },

  /** Messaging operations */
  messages: {
    conversations: () => apiClient.getConversations(),
    messages: (id: string) => apiClient.getMessages(id),
    send: (id: string, message: string) => apiClient.sendMessage(id, message),
    create: (recipientId: string, message: string) =>
      apiClient.createConversation(recipientId, message),
  },

  /** Order management operations */
  orders: {
    list: () => apiClient.getOrders(),
    get: (id: string) => apiClient.getOrder(id),
    create: (data: any) => apiClient.createOrder(data),
    updateStatus: (id: string, status: string) => apiClient.updateOrderStatus(id, status),
  },
}

/** Default export for backward compatibility */
export default apiClient
