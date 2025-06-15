'use client'

import { useEffect, useState } from 'react'

import { HttpTypes } from '@medusajs/types'
import { Box } from '@modules/common/components/box'
import { Container } from '@modules/common/components/container'
import { Heading } from '@modules/common/components/heading'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { Text } from '@modules/common/components/text'

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

export default function BrowsingHistoryTemplate({
  customer,
}: BrowsingHistoryTemplateProps) {
  const [browsingHistory, setBrowsingHistory] = useState<BrowsingHistoryItem[]>(
    []
  )
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
          <Heading as="h1" className="mb-6">
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
          <Heading as="h1" className="mb-6">
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
        <Heading as="h1" className="mb-6">
          Browsing History
        </Heading>

        {browsingHistory.length === 0 ? (
          <Box className="py-12 text-center">
            <Text className="mb-4 text-gray-500">
              You haven&apos;t viewed any products yet.
            </Text>
            <LocalizedClientLink
              href="/products"
              className="inline-block rounded-md bg-black px-6 py-3 text-white transition-colors hover:bg-gray-800"
            >
              Browse Products
            </LocalizedClientLink>
          </Box>
        ) : (
          <Box className="space-y-4">
            {browsingHistory.map((item) => (
              <Box
                key={`${item.product_id}-${item.viewed_at}`}
                className="flex items-center gap-4 rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-md"
              >
                <Box className="relative h-16 w-16 flex-shrink-0">
                  {item.product_thumbnail ? (
                    <img
                      src={item.product_thumbnail}
                      alt={item.product_title}
                      className="h-full w-full rounded object-cover"
                    />
                  ) : (
                    <Box className="flex h-full w-full items-center justify-center rounded bg-gray-200">
                      <Text className="text-xs text-gray-500">No image</Text>
                    </Box>
                  )}
                </Box>

                <Box className="flex-grow">
                  <LocalizedClientLink
                    href={`/products/${item.product_handle}`}
                    className="hover:underline"
                  >
                    <Heading as="h3" className="mb-1 text-lg font-medium">
                      {item.product_title}
                    </Heading>
                  </LocalizedClientLink>

                  {item.variant_title && (
                    <Text className="mb-1 text-sm text-gray-600">
                      Variant: {item.variant_title}
                    </Text>
                  )}

                  <Text className="text-sm text-gray-500">
                    Viewed on {formatDate(item.viewed_at)}
                  </Text>

                  <Box className="text-xs mt-2 flex gap-4 text-gray-400">
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
                    className="inline-block rounded bg-gray-100 px-4 py-2 text-sm transition-colors hover:bg-gray-200"
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
