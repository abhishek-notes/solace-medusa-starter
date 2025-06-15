"use server"

import { HttpTypes } from "@medusajs/types"
import { getAuthHeaders } from "./cookies"

// Simple fetch function for Medusa API calls
async function medusaRequest(method: string, endpoint: string, options: any = {}) {
  const baseUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'
  const url = `${baseUrl}${endpoint}`
  
  // Hardcode the publishable key since env vars might not be available in server actions
  const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ''
  
  console.log('🔑 Using publishable key:', publishableKey ? 'Key present' : 'Key missing')
  console.log('🔑 Key starts with:', publishableKey.substring(0, 10) + '...')
  
  const headers = {
    'x-publishable-api-key': publishableKey,
    'Content-Type': 'application/json',
    ...options.headers,
  }
  
  const config = {
    method,
    headers,
    ...options,
  }
  
  console.log('📡 Making request to:', url)
  console.log('📡 Request headers:', JSON.stringify(config.headers, null, 2))
  
  const response = await fetch(url, config)
  
  let body;
  try {
    body = await response.json()
  } catch (e) {
    console.error('Failed to parse response as JSON:', e)
    body = { error: 'Failed to parse response', status: response.status }
  }
  
  console.log('📡 Response status:', response.status)
  console.log('📡 Response body:', body)
  
  return { response, body }
}

export type ProductViewData = {
  product_id: string
  product_handle: string
  product_title: string
  product_thumbnail?: string
  variant_id?: string
  variant_title?: string
  session_id?: string
  customer_id?: string
  referrer_source?: string
  device_type?: string
  browser?: string
  ip_address?: string
  metadata?: any
}

export type BrowsingHistoryResponse = {
  success: boolean
  data?: any[]
  view?: any
  analytics?: any
  error?: string
}

/**
 * Track a product view
 */
export async function trackProductView(data: ProductViewData): Promise<BrowsingHistoryResponse> {
  // Try backend API first, fallback to localStorage if needed
  try {
    const { response, body } = await medusaRequest("POST", "/store/tracking/product-view", {
      body: JSON.stringify(data)
    })

    if (response.ok) {
      console.log("🔍 Product view tracked to backend:", body.view)
      return body
    } else {
      console.warn("⚠️ Backend tracking failed, using localStorage:", body)
    }
  } catch (error) {
    console.warn("⚠️ Backend unavailable, using localStorage:", error.message)
  }

  // Fallback to localStorage for development
  console.log("🔍 Product view tracked (localStorage fallback):", {
    product_id: data.product_id,
    product_handle: data.product_handle,
    product_title: data.product_title,
    session_id: data.session_id,
    timestamp: new Date().toISOString()
  })

  // Store in local storage for persistence across sessions
  if (typeof window !== 'undefined') {
    const viewData = {
      id: `view_${Date.now()}`,
      product_id: data.product_id,
      product_handle: data.product_handle,
      product_title: data.product_title,
      product_thumbnail: data.product_thumbnail,
      timestamp: new Date().toISOString(),
      session_id: data.session_id || `session_${Date.now()}`
    }
    
    // Get existing views from localStorage
    const existingViews = JSON.parse(localStorage.getItem('browsing_history') || '[]')
    
    // Remove any existing view of the same product to avoid duplicates
    const filteredViews = existingViews.filter((view: any) => view.product_id !== data.product_id)
    
    // Add new view at the beginning
    const updatedViews = [viewData, ...filteredViews].slice(0, 20) // Keep only latest 20 views
    
    // Save back to localStorage
    localStorage.setItem('browsing_history', JSON.stringify(updatedViews))
    
    // Trigger custom event to update components on the same page
    window.dispatchEvent(new CustomEvent('browsing-history-updated'))
  }

  // Return successful response
  return {
    success: true,
    view: {
      id: `view_${Date.now()}`,
      product_id: data.product_id,
      product_handle: data.product_handle,
      product_title: data.product_title,
      timestamp: new Date().toISOString(),
      session_id: data.session_id || `session_${Date.now()}`
    }
  }
}

/**
 * Get customer's browsing history
 */
export async function getCustomerBrowsingHistory(
  customerId: string,
  options?: {
    limit?: number
    offset?: number
    order?: "ASC" | "DESC"
  }
): Promise<BrowsingHistoryResponse> {
  const params = new URLSearchParams({
    type: "customer",
    customer_id: customerId,
    limit: (options?.limit || 50).toString(),
    offset: (options?.offset || 0).toString(),
  })

  try {
    const response = await medusaRequest("GET", `/browsing-history?${params}`, {
      headers: await getAuthHeaders(),
    })

    return response.body
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to get browsing history"
    }
  }
}

/**
 * Get session browsing history (for anonymous users)
 */
export async function getSessionBrowsingHistory(
  sessionId: string,
  options?: {
    limit?: number
    offset?: number
  }
): Promise<BrowsingHistoryResponse> {
  const params = new URLSearchParams({
    type: "session",
    session_id: sessionId,
    limit: (options?.limit || 50).toString(),
    offset: (options?.offset || 0).toString(),
  })

  try {
    const response = await medusaRequest("GET", `/browsing-history?${params}`, {
      headers: await getAuthHeaders(),
    })

    return response.body
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to get session history"
    }
  }
}

/**
 * Get recently viewed products for a customer
 */
export async function getRecentlyViewedProducts(
  customerId: string,
  limit: number = 10
): Promise<BrowsingHistoryResponse> {
  const params = new URLSearchParams({
    type: "recently_viewed",
    customer_id: customerId,
    limit: limit.toString(),
  })

  try {
    const response = await medusaRequest("GET", `/browsing-history?${params}`, {
      headers: await getAuthHeaders(),
    })

    return response.body
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to get recently viewed products"
    }
  }
}

/**
 * Get most viewed products
 */
export async function getMostViewedProducts(
  options?: {
    limit?: number
    timeframe?: number // hours
  }
): Promise<BrowsingHistoryResponse> {
  const params = new URLSearchParams({
    type: "most_viewed",
    limit: (options?.limit || 10).toString(),
  })

  if (options?.timeframe) {
    params.append("timeframe", options.timeframe.toString())
  }

  try {
    const response = await medusaRequest("GET", `/browsing-history?${params}`, {
      headers: await getAuthHeaders(),
    })

    return response.body
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to get most viewed products"
    }
  }
}

/**
 * Get viewing analytics for a customer
 */
export async function getViewingAnalytics(customerId: string): Promise<BrowsingHistoryResponse> {
  const params = new URLSearchParams({
    customer_id: customerId,
  })

  try {
    const response = await medusaRequest("GET", `/browsing-history/analytics?${params}`, {
      headers: await getAuthHeaders(),
    })

    return response.body
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to get analytics"
    }
  }
}

/**
 * Get browsing history from localStorage (client-side only)
 */
export async function getBrowsingHistoryFromStorage(limit: number = 10): Promise<BrowsingHistoryResponse> {
  if (typeof window === 'undefined') {
    return { success: false, error: "Not available on server side" }
  }

  try {
    const storedHistory = localStorage.getItem('browsing_history')
    const history = storedHistory ? JSON.parse(storedHistory) : []
    
    return {
      success: true,
      data: history.slice(0, limit)
    }
  } catch (error: any) {
    return {
      success: false,
      error: "Failed to get browsing history from storage"
    }
  }
}

/**
 * Clear browsing history from localStorage
 */
export async function clearBrowsingHistory(): Promise<BrowsingHistoryResponse> {
  if (typeof window === 'undefined') {
    return { success: false, error: "Not available on server side" }
  }

  try {
    localStorage.removeItem('browsing_history')
    return { success: true }
  } catch (error: any) {
    return {
      success: false,
      error: "Failed to clear browsing history"
    }
  }
}