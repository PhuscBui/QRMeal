import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        hostname: 'localhost',
        pathname: '/**'
      },
      {
        hostname: 'via.placeholder.com',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        pathname: '/**',
        port: '',
        search: ''
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
        port: '',
        search: ''
      }
    ],
    dangerouslyAllowSVG: true,
    domains: ['placehold.co', 'img.freepik.com']
  }
}

export default withNextIntl(nextConfig)
