/**
 * Google Ads Tools - Export all Google Ads tool definitions and handlers
 */

// Tool definitions
export { gadsAccountTools } from './accounts';
export { gadsCampaignTools } from './campaigns';
export { gadsReportTools } from './reports';
export { gadsHealthTools } from './health';

// Handlers - Accounts
export { handleGadsListAccounts, handleGadsGetAccount } from './accounts';

// Handlers - Campaigns
export {
  handleGadsListCampaigns,
  handleGadsGetCampaign,
  handleGadsUpdateCampaignStatus,
  handleGadsUpdateCampaignBudget,
} from './campaigns';

// Handlers - Reports
export {
  handleGadsRunReport,
  handleGadsGetCampaignPerformance,
  handleGadsGetKeywordPerformance,
  handleGadsGetSearchTermsReport,
} from './reports';

// Handlers - Health
export { handleGadsGetChangeHistory, handleGadsGetRecommendations } from './health';

// Combined tool definitions for easy import
import { gadsAccountTools } from './accounts';
import { gadsCampaignTools } from './campaigns';
import { gadsReportTools } from './reports';
import { gadsHealthTools } from './health';

export const GADS_TOOLS = [
  ...gadsAccountTools,
  ...gadsCampaignTools,
  ...gadsReportTools,
  ...gadsHealthTools,
];
