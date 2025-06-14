"use client"

import { useEffect } from 'react'
import { HttpTypes } from '@medusajs/types'
import { useProductTracking } from '@lib/hooks/use-product-tracking'

interface ProductTrackingProps {
  product: HttpTypes.StoreProduct
  customerId?: string
}

export function ProductTracking({ product, customerId }: ProductTrackingProps) {
  useProductTracking({ product, customerId })
  
  // This component doesn't render anything, it just handles tracking
  return null
}