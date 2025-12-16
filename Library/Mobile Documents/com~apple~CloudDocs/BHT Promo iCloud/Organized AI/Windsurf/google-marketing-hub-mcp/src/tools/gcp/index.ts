/**
 * GCP Tools - Export all GCP tool definitions and handlers
 */

// Tool definitions
export { gcpProjectTools } from './projects';
export { gcpServiceAccountTools } from './service-accounts';
export { gcpApiTools } from './apis';
export { gcpBillingTools } from './billing';

// Handlers
export { handleGcpListProjects, handleGcpGetProject } from './projects';
export { handleGcpListServiceAccounts, handleGcpGetServiceAccount } from './service-accounts';
export { handleGcpListEnabledApis, handleGcpEnableApi } from './apis';
export { handleGcpGetBillingInfo, handleGcpListBillingAccounts } from './billing';

// Combined tool definitions for easy import
import { gcpProjectTools } from './projects';
import { gcpServiceAccountTools } from './service-accounts';
import { gcpApiTools } from './apis';
import { gcpBillingTools } from './billing';

export const GCP_TOOLS = [
  ...gcpProjectTools,
  ...gcpServiceAccountTools,
  ...gcpApiTools,
  ...gcpBillingTools,
];
