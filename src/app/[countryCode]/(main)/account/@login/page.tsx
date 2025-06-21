import { Metadata } from 'next'

import LoginTemplate from '@modules/account/templates/login-template'

export const metadata: Metadata = {
  title: 'Sign in - Palladio Jewellers',
  description: 'Sign in to your Palladio Jewellers account.',
}

export default function Login() {
  return <LoginTemplate />
}
