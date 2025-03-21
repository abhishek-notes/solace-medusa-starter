import { processAllImageUrls } from '@lib/util/image-url'
import {
  AboutUsData,
  BlogData,
  BlogPost,
  CollectionsData,
  ContentPageData,
  FAQData,
  HeroBannerData,
  MidBannerData,
  VariantColorData,
} from 'types/strapi'

export const fetchStrapiClient = async (
  endpoint: string,
  params?: RequestInit
) => {
  const baseUrl = process.env.NEXT_PUBLIC_STRAPI_URL.replace(/\/$/, '')
  // Remove any "next" property from headers so it isn’t passed to fetch
  const { next, ...otherParams } = params || {}
  if (
    otherParams.headers &&
    !(otherParams.headers instanceof Headers) &&
    !Array.isArray(otherParams.headers)
  ) {
    const cleanHeaders = { ...otherParams.headers } as Record<string, any>
    delete cleanHeaders.next
    otherParams.headers = cleanHeaders
  }
  // If endpoint already starts with "http", use it as is; otherwise, prepend baseUrl.
  const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`
  console.log('Fetching URL:', url)

  const headers = {
    Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_READ_TOKEN}`,
    ...(otherParams.headers || {}),
  }
  console.log('Fetching URL:', url)
  console.log('Headers:', headers)
  const response = await fetch(url, {
    ...otherParams,
    headers: headers,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      `Failed to fetch data (status ${response.status}): ${errorText}`
    )
  }
  return response
}

// Using the shared image URL processor from the utility
const fixImageUrls = processAllImageUrls

// Homepage data
export const getHeroBannerData = async (): Promise<HeroBannerData> => {
  const url = `${process.env.NEXT_PUBLIC_STRAPI_URL.replace(/\/$/, '')}/api/homepage?populate[1]=HeroBanner&populate[2]=HeroBanner.CTA&populate[3]=HeroBanner.Image`
  const res = await fetchStrapiClient(url, { next: { tags: ['hero-banner'] } })
  const data = await res.json()

  // Specific patch for hero banner image in case not caught by generic fix
  if (data?.data?.attributes?.HeroBanner?.Image?.data?.attributes?.url) {
    const imageUrl = data.data.attributes.HeroBanner.Image.data.attributes.url
    if (imageUrl.startsWith('/')) {
      data.data.attributes.HeroBanner.Image.data.attributes.url =
        process.env.NEXT_PUBLIC_STRAPI_URL.replace(/\/$/, '') + imageUrl
    }
  }

  return fixImageUrls(data)
}

export const getMidBannerData = async (): Promise<MidBannerData> => {
  const url = `${process.env.NEXT_PUBLIC_STRAPI_URL.replace(/\/$/, '')}/api/homepage?populate[1]=MidBanner&populate[2]=MidBanner.CTA&populate[3]=MidBanner.Image`
  const res = await fetchStrapiClient(url, { next: { tags: ['mid-banner'] } })
  const data = await res.json()
  return fixImageUrls(data)
}

export const getCollectionsData = async (): Promise<CollectionsData> => {
  const url = `${process.env.NEXT_PUBLIC_STRAPI_URL.replace(/\/$/, '')}/api/collections?populate=*`
  console.log('Attempting to fetch Collections with URL:', url)
  const res = await fetchStrapiClient(url, {
    next: { tags: ['collections-main'] },
  })
  const data = await res.json()
  console.log(
    'Collections data received:',
    JSON.stringify(data).slice(0, 500) + '...'
  )
  return fixImageUrls(data)
}

export const getExploreBlogData = async (): Promise<BlogData> => {
  const url = `${process.env.NEXT_PUBLIC_STRAPI_URL.replace(/\/$/, '')}/api/blogs?populate[1]=FeaturedImage&sort=createdAt:desc&pagination[start]=0&pagination[limit]=3`
  const res = await fetchStrapiClient(url, { next: { tags: ['explore-blog'] } })
  const data = await res.json()
  return fixImageUrls(data)
}

// Products
export const getProductVariantsColors = async (): Promise<VariantColorData> => {
  const url = `${process.env.NEXT_PUBLIC_STRAPI_URL.replace(/\/$/, '')}/api/product-variants-colors?populate[1]=Type&populate[2]=Type.Image&pagination[start]=0&pagination[limit]=100`
  const res = await fetchStrapiClient(url, {
    next: { tags: ['variants-colors'] },
  })
  const data = await res.json()
  return fixImageUrls(data)
}

// About Us
export const getAboutUs = async (): Promise<AboutUsData> => {
  const url = `${process.env.NEXT_PUBLIC_STRAPI_URL.replace(/\/$/, '')}/api/about-us?populate[1]=Banner&populate[2]=OurStory.Image&populate[3]=OurCraftsmanship.Image&populate[4]=WhyUs.Tile.Image&populate[5]=Numbers`
  const res = await fetchStrapiClient(url, { next: { tags: ['about-us'] } })
  const data = await res.json()
  return fixImageUrls(data)
}

// FAQ
export const getFAQ = async (): Promise<FAQData> => {
  const url = `${process.env.NEXT_PUBLIC_STRAPI_URL.replace(/\/$/, '')}/api/faq?populate[1]=FAQSection&populate[2]=FAQSection.Question`
  const res = await fetchStrapiClient(url, { next: { tags: ['faq'] } })
  const data = await res.json()
  return fixImageUrls(data)
}

// Content Page
export const getContentPage = async (
  type: string,
  tag: string
): Promise<ContentPageData> => {
  const encodedType = encodeURIComponent(type)
  const url = `${process.env.NEXT_PUBLIC_STRAPI_URL.replace(/\/$/, '')}/api/${encodedType}`
  const res = await fetchStrapiClient(url, { next: { tags: [tag] } })
  const data = await res.json()
  return fixImageUrls(data)
}

// Blog
export const getBlogPosts = async ({
  sortBy = 'createdAt:desc',
  query,
  category,
}: {
  sortBy: string
  query?: string
  category?: string
}): Promise<BlogData> => {
  let urlWithFilters = `${process.env.NEXT_PUBLIC_STRAPI_URL.replace(/\/$/, '')}/api/blogs?populate[1]=FeaturedImage&populate[2]=Categories&sort=${sortBy}&pagination[limit]=1000`
  if (query) {
    urlWithFilters += `&filters[Title][$contains]=${encodeURIComponent(query)}`
  }
  if (category) {
    urlWithFilters += `&filters[Categories][Slug][$eq]=${encodeURIComponent(category)}`
  }
  const res = await fetchStrapiClient(urlWithFilters, {
    next: { tags: ['blog'] },
  })
  const data = await res.json()
  return fixImageUrls(data)
}

export const getBlogPostCategories = async (): Promise<BlogData> => {
  const url = `${process.env.NEXT_PUBLIC_STRAPI_URL.replace(/\/$/, '')}/api/blog-post-categories?sort=createdAt:desc&pagination[limit]=100`
  const res = await fetchStrapiClient(url, {
    next: { tags: ['blog-categories'] },
  })
  const data = await res.json()
  return fixImageUrls(data)
}

export const getBlogPostBySlug = async (
  slug: string
): Promise<BlogPost | null> => {
  const encodedSlug = encodeURIComponent(slug)
  const url = `${process.env.NEXT_PUBLIC_STRAPI_URL.replace(/\/$/, '')}/api/blogs?filters[Slug][$eq]=${encodedSlug}`
  const res = await fetchStrapiClient(url, { next: { tags: [`blog-${slug}`] } })
  const data = await res.json()
  const fixedData = fixImageUrls(data)
  if (fixedData.data && fixedData.data.length > 0) {
    return fixedData.data[0]
  }
  return null
}

export const getAllBlogSlugs = async (): Promise<string[]> => {
  const url = `${process.env.NEXT_PUBLIC_STRAPI_URL.replace(/\/$/, '')}/api/blogs`
  const res = await fetchStrapiClient(url)
  const data = await res.json()
  return data.data.map((post: BlogPost) => post.Slug)
}
