import Image from 'next/image'

import { processImageUrl } from '@lib/util/image-url'
import { Box } from '@modules/common/components/box'
import { Button } from '@modules/common/components/button'
import { Container } from '@modules/common/components/container'
import { Heading } from '@modules/common/components/heading'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { Text } from '@modules/common/components/text'
import { HeroBanner } from 'types/strapi'

export const Banner = ({ data }: { data: HeroBanner }) => {
  const { Image: bannerImage, CTA, Headline, Text: text } = data

  if (!bannerImage || !bannerImage.url) {
    console.warn('Banner image is missing or invalid')
    return null
  }

  return (
    <Container>
      <Box className="relative h-[440px] medium:h-[478]">
        <Image
          src={processImageUrl(bannerImage.url)}
          alt={bannerImage.alternativeText ?? 'Banner image'}
          className="object-cover object-right-top"
          fill
        />

        <div className="absolute inset-0 flex flex-col items-center justify-center px-10 text-center text-white">
          <Heading className="text-3xl">{Headline}</Heading>

          <Text size="lg" className="mt-2 medium:max-w-[600px]">
            {text}
          </Text>
          <Button className="mt-8" asChild>
            <LocalizedClientLink href={CTA.BtnLink}>
              {CTA.BtnText}
            </LocalizedClientLink>
          </Button>
        </div>
      </Box>
    </Container>
  )
}
