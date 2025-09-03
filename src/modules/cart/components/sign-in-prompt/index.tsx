"use client"

import { Button, Heading, Text } from '@medusajs/ui'
import { usePathname, useSearchParams } from 'next/navigation'
import LocalizedClientLink from '@modules/common/components/localized-client-link'

const SignInPrompt = () => {
  const pathname = usePathname()
  const search = useSearchParams()
  const current = `${pathname}${search?.toString() ? `?${search.toString()}` : ''}`
  const returnTo = encodeURIComponent(current)
  return (
    <div className="flex items-center justify-between bg-white">
      <div>
        <Heading level="h2" className="txt-xlarge">
          Already have an account?
        </Heading>
        <Text className="txt-medium mt-2 text-ui-fg-subtle">
          Sign in for a better experience.
        </Text>
      </div>
      <div>
        <LocalizedClientLink href={`/account?mode=sign-in&return_to=${returnTo}`}>
          <Button
            variant="secondary"
            className="h-10"
            data-testid="sign-in-button"
          >
            Sign in
          </Button>
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default SignInPrompt
