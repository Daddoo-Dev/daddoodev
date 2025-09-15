// RevenueCat Web Purchase Links Configuration
export const revenueCatConfig = {
  // RevenueCat Web Purchase Links - Add your actual URLs here
  // Production URL: https://pay.rev.cat/vlfphyxewaclhiri/
  purchaseUrls: {
    yearly: "https://pay.rev.cat/vlfphyxewaclhiri/",
    sandbox: {
      yearly: ""
    }
  },
  
  // Success redirect URLs (where users go after successful purchase)
  successRedirects: {
    // Redirect back to your app after purchase
    app: "https://daddoodev.pro/preux/success?purchase=success",
    // Or redirect to a specific success page
    successPage: "https://daddoodev.pro/preux/success"
  },
  
  // Environment settings
  environment: "production", // "production" or "sandbox"
  
  // User identification settings
  userIdentification: {
    // Whether to use App User IDs (for logged-in users)
    useAppUserId: true,
    // Whether to support anonymous purchases with redemption links
    supportRedemptionLinks: true
  }
};

// Helper function to get the correct purchase URL based on environment
export function getPurchaseUrl(plan: 'yearly', appUserId?: string): string {
  const isProduction = revenueCatConfig.environment === "production";
  const baseUrl = isProduction 
    ? revenueCatConfig.purchaseUrls[plan]
    : revenueCatConfig.purchaseUrls.sandbox[plan];
  
  // For identified users, append the App User ID
  if (appUserId && revenueCatConfig.userIdentification.useAppUserId) {
    return `${baseUrl}/${encodeURIComponent(appUserId)}`;
  }
  
  return baseUrl;
}

// Helper function to generate success redirect URL
export function getSuccessRedirectUrl(appUserId?: string): string {
  const baseUrl = revenueCatConfig.successRedirects.app;
  
  if (appUserId) {
    return `${baseUrl}&app_user_id=${encodeURIComponent(appUserId)}`;
  }
  
  return baseUrl;
}

export default revenueCatConfig;
