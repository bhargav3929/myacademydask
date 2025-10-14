import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/coach/',
          '/owner/',
          '/super-admin/',
          '/(app)/',
          '/(coach)/',
          '/(marketing)/',
          '/(owner)/',
        ],
      },
    ],
    sitemap: 'https://myacademydask.com/sitemap.xml',
  }
}
