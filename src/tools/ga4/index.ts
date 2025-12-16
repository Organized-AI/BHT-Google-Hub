/**
 * GA4 Tools - Export all GA4 tool definitions and handlers
 */

// Tool definitions
export { ga4PropertyTools } from './properties';
export { ga4DataStreamTools } from './data-streams';
export { ga4ReportTools } from './reports';
export { ga4AudienceTools } from './audiences';
export { ga4ConversionTools } from './conversions';

// Handlers
export { handleGa4ListProperties, handleGa4GetProperty } from './properties';
export { handleGa4ListDataStreams, handleGa4GetDataStream } from './data-streams';
export { handleGa4RunReport, handleGa4RunRealtimeReport, handleGa4GetMetadata } from './reports';
export { handleGa4ListAudiences, handleGa4GetAudience } from './audiences';
export { handleGa4ListConversionEvents, handleGa4GetConversionEvent } from './conversions';

// Combined tool definitions for easy import
import { ga4PropertyTools } from './properties';
import { ga4DataStreamTools } from './data-streams';
import { ga4ReportTools } from './reports';
import { ga4AudienceTools } from './audiences';
import { ga4ConversionTools } from './conversions';

export const GA4_TOOLS = [
  ...ga4PropertyTools,
  ...ga4DataStreamTools,
  ...ga4ReportTools,
  ...ga4AudienceTools,
  ...ga4ConversionTools,
];
