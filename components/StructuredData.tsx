export default function StructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Shining Stars",
    "alternateName": "Texas Stars Fan Community",
    "url": "https://shiningstars-lac.vercel.app",
    "description": "The #1 Texas Stars fan community featuring live chat, player stats, game news, and countdowns.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://shiningstars-lac.vercel.app/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    },
    "audience": {
      "@type": "Audience",
      "audienceType": "Hockey Fans"
    },
    "about": {
      "@type": "SportsTeam",
      "name": "Texas Stars",
      "sport": "Ice Hockey",
      "memberOf": {
        "@type": "SportsOrganization",
        "name": "American Hockey League",
        "alternateName": "AHL"
      },
      "location": {
        "@type": "Place",
        "name": "H-E-B Center at Cedar Park",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Cedar Park",
          "addressRegion": "TX",
          "addressCountry": "US"
        }
      }
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
