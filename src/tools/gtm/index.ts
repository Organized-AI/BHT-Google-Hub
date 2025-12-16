/**
 * GTM Tools - Export all GTM tool definitions and handlers
 */

// Tool definitions
export { gtmAccountTools } from './accounts';
export { gtmContainerTools } from './containers';
export { gtmWorkspaceTools } from './workspaces';
export { gtmTagTools } from './tags';
export { gtmTriggerTools } from './triggers';
export { gtmVariableTools } from './variables';
export { gtmVersionTools } from './versions';

// Handlers - Accounts
export { handleGtmListAccounts, handleGtmGetAccount } from './accounts';

// Handlers - Containers
export { handleGtmListContainers, handleGtmGetContainer } from './containers';

// Handlers - Workspaces
export { handleGtmListWorkspaces, handleGtmGetWorkspace } from './workspaces';

// Handlers - Tags
export {
  handleGtmListTags,
  handleGtmGetTag,
  handleGtmCreateTag,
  handleGtmUpdateTag,
} from './tags';

// Handlers - Triggers
export {
  handleGtmListTriggers,
  handleGtmGetTrigger,
  handleGtmCreateTrigger,
} from './triggers';

// Handlers - Variables
export {
  handleGtmListVariables,
  handleGtmGetVariable,
  handleGtmCreateVariable,
} from './variables';

// Handlers - Versions
export {
  handleGtmListVersions,
  handleGtmCreateVersion,
  handleGtmPublishVersion,
} from './versions';

// Combined tool definitions for easy import
import { gtmAccountTools } from './accounts';
import { gtmContainerTools } from './containers';
import { gtmWorkspaceTools } from './workspaces';
import { gtmTagTools } from './tags';
import { gtmTriggerTools } from './triggers';
import { gtmVariableTools } from './variables';
import { gtmVersionTools } from './versions';

export const GTM_TOOLS = [
  ...gtmAccountTools,
  ...gtmContainerTools,
  ...gtmWorkspaceTools,
  ...gtmTagTools,
  ...gtmTriggerTools,
  ...gtmVariableTools,
  ...gtmVersionTools,
];
