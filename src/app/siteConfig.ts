export const siteConfig = {
  name: "yourname",
  url: "https://yoururl.com",
  description: "IoT-based pig monitoring and health tracking system",
  baseLinks: {
    home: "/",
    overview: "/overview",
    details: "/details",
    support: "/support", 
    settings: {
      general: "/settings/general",
      devices: "/settings/devices",
      alerts: "/settings/alerts",
    },
    systemOverview:  {
      farms: "/system-overview/overview",
      monitoring: "/system-overview/monitoring",
      insights: "/system-overview/insights",
    }

  },
}

export type SiteConfig = typeof siteConfig