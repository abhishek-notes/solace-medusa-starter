"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getBrowsingHistoryFromStorage } from '@lib/data/tracking'
import { Box } from '@modules/common/components/box'
import { Container } from '@modules/common/components/container'
import { Heading } from '@modules/common/components/heading'

interface RecentlyViewedProps {
  regionId: string
  countryCode: string
  currentProductId?: string
  customerId?: string
  limit?: number
}

interface ViewedProduct {
  id: string
  product_id: string
  product_handle: string
  product_title: string
  product_thumbnail?: string
  timestamp: string
  session_id: string
}

export function RecentlyViewed({ 
  regionId, 
  countryCode,
  currentProductId, 
  customerId,
  limit = 8 
}: RecentlyViewedProps) {
  const [recentlyViewedProducts, setRecentlyViewedProducts] = useState<ViewedProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecentlyViewed = () => {
      try {
        const history = getBrowsingHistoryFromStorage(limit + 1) // Get one extra in case we need to filter current product
        
        if (history.success && history.data) {
          // Filter out the current product if provided
          const filteredData = currentProductId 
            ? history.data.filter((item: ViewedProduct) => item.product_id !== currentProductId)
            : history.data
          
          setRecentlyViewedProducts(filteredData.slice(0, limit))
        }
      } catch (error) {
        console.warn('Error fetching recently viewed products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecentlyViewed()

    // Listen for storage changes to update the component when new products are viewed
    const handleStorageChange = () => {
      fetchRecentlyViewed()
    }

    window.addEventListener('storage', handleStorageChange)
    
    // Also listen for custom event when localStorage is updated from the same page
    window.addEventListener('browsing-history-updated', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('browsing-history-updated', handleStorageChange)
    }
  }, [currentProductId, limit])

  if (loading || recentlyViewedProducts.length === 0) {
    return null
  }

  return (
    <Container className="py-12">
      <Box className="mb-8 flex justify-between items-center">
        <Heading as="h2" className="text-2xl font-medium text-basic-primary">
          Recently Viewed
        </Heading>
        <Link 
          href={`/${countryCode}/account/browsing-history`}
          className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          View All
        </Link>
      </Box>
      <Box className="grid grid-cols-2 gap-4 small:grid-cols-3 medium:grid-cols-4 large:gap-6">
        {recentlyViewedProducts.map((product) => (
          <Link
            key={product.id}
            href={`/${countryCode}/products/${product.product_handle}`}
            className="group block bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="aspect-square bg-gray-100 overflow-hidden">
              {product.product_thumbnail ? (
                <img
                  src={product.product_thumbnail}
                  alt={product.product_title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <span className="text-gray-500 text-xs text-center">No Image</span>
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-medium text-sm group-hover:text-gray-600 transition-colors line-clamp-2 mb-2">
                {product.product_title}
              </h3>
              <p className="text-xs text-gray-500">
                Viewed {new Date(product.timestamp).toLocaleDateString()}
              </p>
            </div>
          </Link>
        ))}
      </Box>
    </Container>
  )
}