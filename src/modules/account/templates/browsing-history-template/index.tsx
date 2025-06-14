"use client"

import { useEffect, useState } from 'react'
import { HttpTypes } from '@medusajs/types'
import { Box } from '@modules/common/components/box'
import { Container } from '@modules/common/components/container'
import { Heading } from '@modules/common/components/heading'
import { Text } from '@modules/common/components/text'
import LocalizedClientLink from '@modules/common/components/localized-client-link'

interface BrowsingHistoryItem {
  id: string
  product_id: string
  product_handle: string
  product_title: string
  product_thumbnail?: string
  variant_id?: string
  variant_title?: string
  viewed_at: string
  view_duration: number
  device_type?: string
  browser?: string
}

interface BrowsingHistoryTemplateProps {
  customer: HttpTypes.StoreCustomer
}

export default function BrowsingHistoryTemplate({ customer }: BrowsingHistoryTemplateProps) {
  const [browsingHistory, setBrowsingHistory] = useState<BrowsingHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBrowsingHistory = async () => {
      try {
        const response = await fetch('/api/account/browsing-history', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            customerId: customer.id,
            limit: 50,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success && data.data) {
            setBrowsingHistory(data.data)
          }
        } else {
          setError('Failed to load browsing history')
        }
      } catch (err) {
        console.error('Error fetching browsing history:', err)
        setError('Failed to load browsing history')
      } finally {
        setLoading(false)
      }
    }

    fetchBrowsingHistory()
  }, [customer.id])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <Container>
        <Box className="py-6">
          <Heading level="h1" className="mb-6">
            Browsing History
          </Heading>
          <Text>Loading your browsing history...</Text>
        </Box>
      </Container>
    )
  }

  if (error) {
    return (
      <Container>
        <Box className="py-6">
          <Heading level="h1" className="mb-6">
            Browsing History
          </Heading>
          <Text className="text-red-500">{error}</Text>
        </Box>
      </Container>
    )
  }

  return (
    <Container>
      <Box className="py-6">
        <Heading level="h1" className="mb-6">
          Browsing History
        </Heading>
        
        {browsingHistory.length === 0 ? (
          <Box className="text-center py-12">
            <Text className="text-gray-500 mb-4">
              You haven't viewed any products yet.
            </Text>
            <LocalizedClientLink
              href="/products"
              className="inline-block bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors"
            >
              Browse Products
            </LocalizedClientLink>
          </Box>
        ) : (
          <Box className="space-y-4">
            {browsingHistory.map((item) => (
              <Box
                key={`${item.product_id}-${item.viewed_at}`}
                className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <Box className="relative w-16 h-16 flex-shrink-0">
                  {item.product_thumbnail ? (
                    <img
                      src={item.product_thumbnail}
                      alt={item.product_title}
                      className="w-full h-full object-cover rounded"
                    />
                  ) : (
                    <Box className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                      <Text className="text-xs text-gray-500">No image</Text>
                    </Box>
                  )}
                </Box>
                
                <Box className="flex-grow">
                  <LocalizedClientLink
                    href={`/products/${item.product_handle}`}
                    className="hover:underline"
                  >
                    <Heading level="h3" className="text-lg font-medium mb-1">
                      {item.product_title}
                    </Heading>
                  </LocalizedClientLink>
                  
                  {item.variant_title && (
                    <Text className="text-sm text-gray-600 mb-1">
                      Variant: {item.variant_title}
                    </Text>
                  )}
                  
                  <Text className="text-sm text-gray-500">
                    Viewed on {formatDate(item.viewed_at)}
                  </Text>
                  
                  <Box className="flex gap-4 mt-2 text-xs text-gray-400">
                    {item.device_type && (
                      <Text>Device: {item.device_type}</Text>
                    )}
                    {item.view_duration > 0 && (
                      <Text>Duration: {Math.round(item.view_duration)}s</Text>
                    )}
                  </Box>
                </Box>
                
                <Box className="flex-shrink-0">
                  <LocalizedClientLink
                    href={`/products/${item.product_handle}`}
                    className="inline-block bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded text-sm transition-colors"
                  >
                    View Product
                  </LocalizedClientLink>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Container>
  )
}