import { NextRequest, NextResponse } from 'next/server'

import { getCustomerBrowsingHistory } from '@lib/data/tracking'

export async function POST(request: NextRequest) {
  try {
    const { customerId, limit, offset } = await request.json()

    if (!customerId) {
      return NextResponse.json(
        { success: false, error: 'Customer ID is required' },
        { status: 400 }
      )
    }

    const result = await getCustomerBrowsingHistory(customerId, {
      limit: limit || 50,
      offset: offset || 0,
      order: 'DESC',
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching customer browsing history:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch browsing history' },
      { status: 500 }
    )
  }
}
