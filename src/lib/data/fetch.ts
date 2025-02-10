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
  // Destructure "next" from params so that it doesn't get passed to native fetch,
  // and clean any "next" property from nested headers if present
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
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_STRAPI_URL}${endpoint}`,
    {
      ...otherParams,
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_READ_TOKEN}`,
        ...(otherParams.headers || {}),
      },
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      `Failed to fetch data (status ${response.status}): ${errorText}`
    )
  }

  return response
}

// Homepage data
export const getHeroBannerData = async (): Promise<HeroBannerData> => {
  const res = await fetchStrapiClient(
    `/api/homepage?populate[1]=HeroBanner&populate[2]=HeroBanner.CTA&populate[3]=HeroBanner.Image`,
    {
      next: { tags: ['hero-banner'] },
    }
  )

  return res.json()
}

export const getMidBannerData = async (): Promise<MidBannerData> => {
  const res = await fetchStrapiClient(
    `/api/homepage?populate[1]=MidBanner&populate[2]=MidBanner.CTA&populate[3]=MidBanner.Image`,
    {
      next: { tags: ['mid-banner'] },
    }
  )

  return res.json()
}

export const getCollectionsData = async (): Promise<CollectionsData> => {
  console.log('NEXT_PUBLIC_STRAPI_URL:', process.env.NEXT_PUBLIC_STRAPI_URL)
  console.log(
    'NEXT_PUBLIC_STRAPI_READ_TOKEN:',
    process.env.NEXT_PUBLIC_STRAPI_READ_TOKEN
  )
  const url = `/api/collections`
  console.log('Fetching URL:', url)
  const res = await fetchStrapiClient(url, {
    next: { tags: ['collections-main'] },
  })

  return res.json()
}

export const getExploreBlogData = async (): Promise<BlogData> => {
  const res = await fetchStrapiClient(
    `/api/blogs?populate[1]=FeaturedImage&sort=createdAt:desc&pagination[start]=0&pagination[limit]=3`,
    {
      next: { tags: ['explore-blog'] },
    }
  )

  return res.json()
}

// Products
export const getProductVariantsColors = async (): Promise<VariantColorData> => {
  const res = await fetchStrapiClient(
    `/api/product-variants-colors?populate[1]=Type&populate[2]=Type.Image&pagination[start]=0&pagination[limit]=100`,
    {
      next: { tags: ['variants-colors'] },
    }
  )

  return res.json()
}

// About Us
export const getAboutUs = async (): Promise<AboutUsData> => {
  const res = await fetchStrapiClient(
    `/api/about-us?populate[1]=Banner&populate[2]=OurStory.Image&populate[3]=OurCraftsmanship.Image&populate[4]=WhyUs.Tile.Image&populate[5]=Numbers`,
    {
      next: { tags: ['about-us'] },
    }
  )

  return res.json()
}

// FAQ
export const getFAQ = async (): Promise<FAQData> => {
  const res = await fetchStrapiClient(
    `/api/faq?populate[1]=FAQSection&populate[2]=FAQSection.Question`,
    {
      next: { tags: ['faq'] },
    }
  )

  return res.json()
}

// Content Page
export const getContentPage = async (
  type: string,
  tag: string
): Promise<ContentPageData> => {
  const res = await fetchStrapiClient(`/api/${type}?populate=*`, {
    next: { tags: [tag] },
  })

  return res.json()
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
  const baseUrl = `/api/blogs?populate[1]=FeaturedImage&populate[2]=Categories&sort=${sortBy}&pagination[limit]=1000`

  let urlWithFilters = baseUrl

  if (query) {
    urlWithFilters += `&filters[Title][$contains]=${query}`
  }

  if (category) {
    urlWithFilters += `&filters[Categories][Slug][$eq]=${category}`
  }

  const res = await fetchStrapiClient(urlWithFilters, {
    next: { tags: ['blog'] },
  })

  return res.json()
}

export const getBlogPostCategories = async (): Promise<BlogData> => {
  const res = await fetchStrapiClient(
    `/api/blog-post-categories?sort=createdAt:desc&pagination[limit]=100`,
    {
      next: { tags: ['blog-categories'] },
    }
  )

  return res.json()
}

// Blog
export const getBlogPostBySlug = async (
  slug: string
): Promise<BlogPost | null> => {
  const res = await fetchStrapiClient(
    `/api/blogs?filters[Slug][$eq]=${slug}&populate=*`,
    {
      next: { tags: [`blog-${slug}`] },
    }
  )

  const data = await res.json()

  if (data.data && data.data.length > 0) {
    return data.data[0]
  }

  return null
}

export const getAllBlogSlugs = async (): Promise<string[]> => {
  const res = await fetchStrapiClient(`/api/blogs?populate=*`, {
    next: { tags: ['blog-slugs'] },
  })

  const data = await res.json()
  return data.data.map((post: BlogPost) => post.Slug)
}
