import { Metadata } from 'next'

import { getBaseURL } from '@lib/util/env'
import { ProgressBar } from '@modules/common/components/progress-bar'
import { ThemeProvider } from '@modules/common/components/theme-provider'
import { Toaster } from 'sonner'

import 'styles/globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
  title: {
    default: 'Palladio Jewellers',
    template: '%s | Palladio Jewellers',
  },
  description: 'Discover exquisite jewelry at Palladio Jewellers. Browse our collection of fine jewelry, engagement rings, and luxury accessories.',
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="text-basic-primary">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          // disableTransitionOnChange
        >
          <ProgressBar />
          <Toaster position="bottom-right" offset={65} closeButton />
          <main className="relative">{props.children}</main>
        </ThemeProvider>
      </body>
    </html>
  )
}
