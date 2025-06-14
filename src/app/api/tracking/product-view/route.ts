import { NextRequest, NextResponse } from 'next/server'
import { trackProductView } from '@lib/data/tracking'
import { getSessionId, setSessionId } from '@lib/data/cookies'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Get or create session ID from cookies
    let sessionId = await getSessionId()
    if (!sessionId) {
      sessionId = data.session_id || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      await setSessionId(sessionId)
    }
    
    // Add session ID to tracking data
    const trackingData = {
      ...data,
      session_id: sessionId,
      ip_address: request.ip || request.headers.get('x-forwarded-for') || 'unknown',
    }
    
    const result = await trackProductView(trackingData)
    
    if (result.success) {
      return NextResponse.json(result, { status: 200 })
    } else {
      return NextResponse.json(result, { status: 400 })
    }
  } catch (error) {
    console.error('Error in product view tracking API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}