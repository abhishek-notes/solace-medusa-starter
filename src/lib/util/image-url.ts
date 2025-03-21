/**
 * Utility functions for handling image URLs
 */

/**
 * Processes an image URL to ensure it's properly formatted for display
 * - Handles relative paths from Strapi
 * - Handles Minio bucket paths
 * - Returns a fallback for empty/undefined URLs
 */
export const processImageUrl = (imgSrc: string | undefined): string => {
  if (!imgSrc || imgSrc.trim() === '') {
    return '/placeholder-image.jpg'
  }

  if (imgSrc.startsWith('http')) {
    return imgSrc
  }

  if (imgSrc.startsWith('/uploads')) {
    // Handle Strapi relative URLs
    const strapiBaseUrl =
      process.env.NEXT_PUBLIC_STRAPI_URL?.replace(/\/$/, '') || ''
    return `${strapiBaseUrl}${imgSrc}`
  }

  // Handle other relative paths - assume they're in Minio
  const filename = imgSrc.split('/').pop() || ''
  return `https://bucket-production-3bbd.up.railway.app/medusa-bucket/medusa-bucket/${filename}`
}

/**
 * Processes an entire data object to fix all image URLs recursively
 */
export const processAllImageUrls = (data: any): any => {
  if (Array.isArray(data)) {
    return data.map(processAllImageUrls)
  } else if (typeof data === 'object' && data !== null) {
    // If object has a property 'url' that's a relative path, fix it.
    if ('url' in data && typeof data.url === 'string') {
      data.url = processImageUrl(data.url)
    }

    // Process all nested objects
    for (const key in data) {
      data[key] = processAllImageUrls(data[key])
    }
  }
  return data
}
