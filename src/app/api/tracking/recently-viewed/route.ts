import { NextRequest, NextResponse } from 'next/server'
import { getSessionBrowsingHistory, getCustomerBrowsingHistory } from '@lib/data/tracking'
import { getSessionId } from '@lib/data/cookies'

export async function POST(request: NextRequest) {
  try {
    const { customerId, currentProductId, limit } = await request.json()
    
    let result
    
    if (customerId) {
      // Get browsing history for logged-in customer
      result = await getCustomerBrowsingHistory(customerId, {
        limit: limit || 10,
        offset: 0,
        order: "DESC"
      })
    } else {
      // Get browsing history for anonymous session
      const sessionId = await getSessionId()
      if (!sessionId) {
        return NextResponse.json({
          success: true,
          data: []
        })
      }
      
      result = await getSessionBrowsingHistory(sessionId, {
        limit: limit || 10,
        offset: 0
      })
    }
    
    if (result.success && result.data) {
      // Filter out current product and transform data for frontend
      const filteredData = result.data
        .filter((item: any) => item.product_id !== currentProductId)
        .map((item: any) => ({
          id: item.product_id,
          title: item.product_title,
          handle: item.product_handle,
          thumbnail: item.product_thumbnail || '/placeholder.jpg',
          created_at: item.viewed_at,
          calculatedPrice: '$0.00', // This would need to be fetched from product data
          salePrice: '$0.00' // This would need to be fetched from product data
        }))
      
      return NextResponse.json({
        success: true,
        data: filteredData
      })
    }
    
    return NextResponse.json({
      success: true,
      data: []
    })
    
  } catch (error) {
    console.error('Error fetching recently viewed products:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch recently viewed products' },
      { status: 500 }
    )
  }
}