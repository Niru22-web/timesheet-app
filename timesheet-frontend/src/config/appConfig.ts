export const APP_CONFIG = {
  COMPANY_NAME: "Ashish Shah and Associates",
  COMPANY_SHORT_NAME: "Ashish Shah & Associates",
  APP_NAME: "Timesheet Management System",
  APP_VERSION: "1.0.0",
  
  // Contact Information
  CONTACT: {
    EMAIL: "info@ashishshah.com",
    PHONE: "+91-XXXX-XXXX-XX",
    ADDRESS: "Your Office Address Here"
  },
  
  // Theme & Branding
  BRAND: {
    PRIMARY_COLOR: "#4f46e5",
    SECONDARY_COLOR: "#6b7280",
    LOGO_ALT: "Ashish Shah and Associates Logo"
  },
  
  // URLs
  URLS: {
    WEBSITE: "https://www.ashishshah.com",
    SUPPORT: "mailto:support@ashishshah.com"
  }
} as const;

// Type exports for TypeScript
export type AppConfig = typeof APP_CONFIG;
