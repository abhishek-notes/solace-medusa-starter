import { Metadata } from 'next'

import { getCustomer } from '@lib/data/customer'
import BrowsingHistoryTemplate from '@modules/account/templates/browsing-history-template'

export const metadata: Metadata = {
  title: 'Browsing History',
  description: 'View your product browsing history.',
}

export default async function BrowsingHistory() {
  const customer = await getCustomer()

  if (!customer) {
    return null
  }

  return <BrowsingHistoryTemplate customer={customer} />
}