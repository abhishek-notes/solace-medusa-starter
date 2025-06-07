import { HttpTypes } from '@medusajs/types'

import { getPercentageDiff } from './get-precentage-diff'
import { convertToLocale } from './money'

export const getPricesForVariant = (variant: any) => {
  // Try calculated_price first (if available)
  if (variant?.calculated_price?.calculated_amount) {
    return {
      calculated_price_number: variant.calculated_price.calculated_amount,
      calculated_price: convertToLocale({
        amount: variant.calculated_price.calculated_amount,
        currency_code: variant.calculated_price.currency_code,
      }),
      original_price_number: variant.calculated_price.original_amount,
      original_price: convertToLocale({
        amount: variant.calculated_price.original_amount,
        currency_code: variant.calculated_price.currency_code,
      }),
      currency_code: variant.calculated_price.currency_code,
      price_type: variant.calculated_price.calculated_price?.price_list_type,
      percentage_diff: getPercentageDiff(
        variant.calculated_price.original_amount,
        variant.calculated_price.calculated_amount
      ),
    }
  }
  
  // Fallback to raw prices if calculated_price not available
  if (variant?.prices?.[0]) {
    const price = variant.prices[0];
    return {
      calculated_price_number: price.amount,
      calculated_price: convertToLocale({
        amount: price.amount,
        currency_code: price.currency_code,
      }),
      original_price_number: price.amount,
      original_price: convertToLocale({
        amount: price.amount,
        currency_code: price.currency_code,
      }),
      currency_code: price.currency_code,
      price_type: 'default',
      percentage_diff: 0,
    }
  }
  
  return null
}

export function getProductPrice({
  product,
  variantId,
}: {
  product: HttpTypes.StoreProduct
  variantId?: string
}) {
  if (!product || !product.id) {
    throw new Error('No product provided')
  }

  const cheapestPrice = () => {
    if (!product || !product.variants?.length) {
      return null
    }

    // Try to find variants with calculated_price first
    let cheapestVariant: any = product.variants
      .filter((v: any) => !!v.calculated_price)
      .sort((a: any, b: any) => {
        return (
          a.calculated_price.calculated_amount -
          b.calculated_price.calculated_amount
        )
      })[0]
    
    // Fallback to variants with prices if no calculated_price
    if (!cheapestVariant) {
      cheapestVariant = product.variants
        .filter((v: any) => !!v.prices?.[0])
        .sort((a: any, b: any) => {
          return (a.prices[0].amount - b.prices[0].amount)
        })[0]
    }

    return getPricesForVariant(cheapestVariant)
  }

  const variantPrice = () => {
    if (!product || !variantId) {
      return null
    }

    const variant: any = product.variants?.find(
      (v) => v.id === variantId || v.sku === variantId
    )

    if (!variant) {
      return null
    }

    return getPricesForVariant(variant)
  }

  return {
    product,
    cheapestPrice: cheapestPrice(),
    variantPrice: variantPrice(),
  }
}
