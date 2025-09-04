import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import {
  getCollectionByHandle,
  getCollectionsList,
} from '@lib/data/collections'
import { listRegions } from '@lib/data/regions'
import { StoreCollection, StoreRegion } from '@medusajs/types'
import { Box } from '@modules/common/components/box'
import { Container } from '@modules/common/components/container'
import { Heading } from '@modules/common/components/heading'
import StoreBreadcrumbs from '@modules/store/templates/breadcrumbs'

export const revalidate = 300 // ISR for metadata/regions where possible

interface CollectionPageLayoutProps {
  children: React.ReactNode
  params: Promise<{ handle: string; countryCode: string }>
}

export async function generateStaticParams() {
  try {
    const { collections } = await getCollectionsList()
    if (!collections?.length) return []

    const countryCodes = await listRegions().then(
      (regions: StoreRegion[]) =>
        regions
          ?.map((r) => r.countries?.map((c) => c.iso_2))
          .flat()
          .filter(Boolean) as string[]
    )

    const collectionHandles = collections.map((c: StoreCollection) => c.handle)
    return countryCodes
      ?.map((countryCode: string) =>
        collectionHandles.map((handle: string | undefined) => ({
          countryCode,
          handle,
        }))
      )
      .flat()
  } catch (e) {
    console.warn('[generateStaticParams] upstream unavailable; returning []')
    return []
  }
}

export async function generateMetadata(
  props: CollectionPageLayoutProps
): Promise<Metadata> {
  const params = await props.params
  try {
    const collection = await getCollectionByHandle(params.handle)
    if (!collection) notFound()
    return {
      title: collection.title,
      description: `${collection.title} collection`,
    }
  } catch (e) {
    // Fall back to generic metadata rather than failing the build
    return {
      title: 'Collection',
      description: 'Browse our collection',
    }
  }
}

export default async function CollectionPageLayout(
  props: CollectionPageLayoutProps
) {
  const params = await props.params
  const { children } = props

  // Render UI even if upstream is briefly down
  let currentCollection: StoreCollection | null = null
  try {
    currentCollection = await getCollectionByHandle(params.handle).then(
      (c) => c as StoreCollection
    )
  } catch (e) {
    // soft-fallback; you can choose to notFound() if this is truly critical
  }

  return (
    <>
      <Container className="flex flex-col gap-8 !py-8">
        <Box className="flex flex-col gap-4">
          <StoreBreadcrumbs breadcrumb={currentCollection.title} />
          <Heading
            as="h1"
            className="text-4xl text-basic-primary small:text-5xl"
          >
            {currentCollection.title}
          </Heading>
        </Box>
      </Container>
      {children}
    </>
  )
}
