export function OrganizationStructuredData() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'My Academy Desk',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description: 'The ultimate sports academy management platform for multi-sport facilities. Manage coaches, athletes, attendance, revenue, and operations seamlessly.',
    url: 'https://myacademydask.com',
    offers: {
      '@type': 'Offer',
      price: '1499',
      priceCurrency: 'INR',
      priceValidUntil: '2025-12-31',
      availability: 'https://schema.org/InStock',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      ratingCount: '420',
      bestRating: '5',
      worstRating: '1',
    },
    provider: {
      '@type': 'Organization',
      name: 'My Academy Desk',
      url: 'https://myacademydask.com',
      logo: 'https://myacademydask.com/landing-logo.png',
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+91-95531-43929',
        contactType: 'Customer Support',
        availableLanguage: ['English', 'Hindi'],
        areaServed: 'IN',
      },
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'IN',
        addressRegion: 'India',
      },
      sameAs: [
        // Add your social media URLs when ready
        // 'https://twitter.com/myacademydask',
        // 'https://facebook.com/myacademydask',
        // 'https://linkedin.com/company/myacademydask'
      ],
    },
    features: [
      'Coach Management',
      'Athlete Management', 
      'Attendance Tracking',
      'Revenue Management',
      'Multi-sport Support',
      'Real-time Dashboards',
      'Automated Communications',
      'Performance Analytics'
    ],
    applicationSubCategory: 'Sports Management Software',
    downloadUrl: 'https://myacademydask.com',
    installUrl: 'https://myacademydask.com/login',
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

export function WebsiteStructuredData() {
  const websiteData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'My Academy Desk',
    url: 'https://myacademydask.com',
    description: 'Sports Academy Management System for multi-sport facilities',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://myacademydask.com/search?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
    publisher: {
      '@type': 'Organization',
      name: 'My Academy Desk',
      logo: 'https://myacademydask.com/landing-logo.png',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteData) }}
    />
  )
}

export function BreadcrumbStructuredData({ items }: { items: Array<{ name: string; url: string }> }) {
  const breadcrumbData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
    />
  )
}
