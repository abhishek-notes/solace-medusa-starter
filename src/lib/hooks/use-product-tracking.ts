'use client'

import { useEffect } from 'react'

import { HttpTypes } from '@medusajs/types'

interface UseProductTrackingProps {
  product: HttpTypes.StoreProduct
  customerId?: string
}

export function useProductTracking({
  product,
  customerId,
}: UseProductTrackingProps) {
  useEffect(() => {
    const trackView = async () => {
      // Generate or get session ID from localStorage for anonymous users
      let sessionId = localStorage.getItem('_medusa_session_id')
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        localStorage.setItem('_medusa_session_id', sessionId)
      }

      // Get device and browser info
      const deviceType = /Mobi|Android/i.test(navigator.userAgent)
        ? 'mobile'
        : 'desktop'
      const browser =
        navigator.userAgent.split(' ').pop()?.split('/')[0] || 'unknown'

      const trackingData = {
        product_id: product.id,
        product_handle: product.handle!,
        product_title: product.title!,
        product_thumbnail: product.thumbnail || undefined,
        session_id: sessionId,
        customer_id: customerId,
        device_type: deviceType,
        browser: browser,
        referrer_source: document.referrer || undefined,
        metadata: {
          collection_id: product.collection_id,
          product_type: product.type?.value,
          page_url: window.location.href,
          timestamp: new Date().toISOString(),
        },
      }

      try {
        const response = await fetch('/api/tracking/product-view', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(trackingData),
        })

        if (!response.ok) {
          console.warn('Failed to track product view:', response.statusText)
        }
      } catch (error) {
        console.warn('Error tracking product view:', error)
      }
    }

    // Track view after a small delay to ensure page is fully loaded
    const timeoutId = setTimeout(trackView, 1000)

    return () => clearTimeout(timeoutId)
  }, [
    product.id,
    product.handle,
    product.title,
    product.thumbnail,
    product.collection_id,
    product.type?.value,
    customerId,
  ])
}
