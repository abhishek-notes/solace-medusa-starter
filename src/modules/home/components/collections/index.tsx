'use client'

import { useMemo } from 'react'
import Image from 'next/image'

import { cn } from '@lib/util/cn'
import { processImageUrl } from '@lib/util/image-url'
import { StoreCollection } from '@medusajs/types'
import { Box } from '@modules/common/components/box'
import { Button } from '@modules/common/components/button'
import { Container } from '@modules/common/components/container'
import { Heading } from '@modules/common/components/heading'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { Text } from '@modules/common/components/text'
import { CollectionsData } from 'types/strapi'

// Simple image component with standard img tag
const CollectionImage = ({ src, alt }: { src: string; alt: string }) => {
  if (!src) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gray-200">
        <p className="text-gray-500">No Image</p>
      </div>
    )
  }

  return (
    <div className="relative h-full w-full">
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        loading="lazy"
      />
    </div>
  )
}

const CollectionTile = ({
  title,
  handle,
  imgSrc,
  description,
  id,
}: {
  title: string
  handle: string
  imgSrc: string
  description: string
  id: number
}) => {
  console.log(`Collection Tile Debug:
    Title: ${title}
    Handle: ${handle}
    Image Source: ${imgSrc}
    Image Source Type: ${typeof imgSrc}
    Image Source Validity: ${!!imgSrc}
  `)

  // Use the shared image URL processing utility
  const absoluteImgSrc = useMemo(() => {
    console.log(`Processing image URL: ${imgSrc}`)
    return processImageUrl(imgSrc)
  }, [imgSrc])

  return (
    <Box
      className={cn('group relative', {
        'small:col-start-2 small:row-start-1 small:row-end-3': id === 2,
      })}
    >
      <div className="relative aspect-video w-full overflow-hidden">
        <CollectionImage
          src={absoluteImgSrc}
          alt={`${title} collection image`}
        />
      </div>
      <Box className="absolute left-0 top-0 hidden h-full w-full flex-col p-6 small:flex large:p-10">
        <Button
          asChild
          className="w-max self-end transition-all duration-500 ease-in-out large:opacity-0 large:group-hover:opacity-100"
        >
          <LocalizedClientLink href={`/collections/${handle}`}>
            Discover
          </LocalizedClientLink>
        </Button>
        <Box className="mt-auto text-static">
          <Heading as="h3" className="mt-auto text-2xl large:text-3xl">
            {title}
          </Heading>
          <Text
            size="lg"
            className="line-clamp-2 transition-all duration-500 ease-in-out large:h-0 large:opacity-0 large:group-hover:h-12 large:group-hover:opacity-100"
          >
            {description}
          </Text>
        </Box>
      </Box>
      <Box className="absolute left-0 top-0 block h-full w-full p-6 small:hidden large:p-10">
        <LocalizedClientLink
          href={`/collections/${handle}`}
          className="flex h-full w-full flex-col justify-end"
        >
          <Heading as="h3" className="text-2xl text-static large:text-3xl">
            {title}
          </Heading>
        </LocalizedClientLink>
      </Box>
    </Box>
  )
}

const Collections = ({
  cmsCollections,
  medusaCollections,
}: {
  cmsCollections: CollectionsData
  medusaCollections: StoreCollection[]
}) => {
  const validCollections = useMemo(() => {
    if (!cmsCollections.data.length || !medusaCollections.length) return null
    const collections = cmsCollections.data.filter((cmsCollection) =>
      medusaCollections.some(
        (medusaCollection) => medusaCollection.handle === cmsCollection.Handle
      )
    )
    if (!collections || collections.length < 3) return null
    return collections.sort((a, b) => b.id - a.id)
  }, [cmsCollections, medusaCollections])

  const newestCollections = useMemo(() => {
    if (!validCollections) return null
    return validCollections.slice(0, 3)
  }, [validCollections])

  if (!newestCollections) return null

  return (
    <Container className="grid max-h-[660px] grid-rows-3 gap-2 small:max-h-[440px] small:grid-cols-2 small:grid-rows-2 large:max-h-[660px]">
      {newestCollections.slice(0, 3).map((element, id) => (
        <CollectionTile
          key={id}
          title={element.Title}
          handle={element.Handle}
          imgSrc={element.Image?.url}
          description={element.Description}
          id={id}
        />
      ))}
    </Container>
  )
}

export default Collections
