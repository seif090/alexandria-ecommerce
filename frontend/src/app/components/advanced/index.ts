/**
 * Advanced Features Barrel Export
 * Central export point for all advanced dashboard and system components
 */

// Analytics
export { AnalyticsDashboardComponent } from './analytics/advanced-analytics-dashboard.component';

// Vendor Management
export { VendorManagementSuiteComponent } from './vendor/vendor-management-suite.component';

// Fulfillment
export { FulfillmentSystemComponent } from './fulfillment/fulfillment-system.component';

// Responsive Components
export {
  ResponsiveContainerComponent,
  MobileSheetComponent,
  ResponsiveGridDirective,
  ResponsiveTextDirective,
  SafeAreaDirective,
  TouchFriendlyDirective,
  ResponsivePaddingDirective,
  ResponsiveHeadingComponent,
  ResponsiveStackComponent
} from './shared/responsive-layout.component';

/**
 * Usage Example:
 * 
 * import {
 *   AnalyticsDashboardComponent,
 *   VendorManagementSuiteComponent,
 *   FulfillmentSystemComponent,
 *   ResponsiveContainerComponent
 * } from './components/advanced';
 * 
 * @Component({
 *   imports: [
 *     AnalyticsDashboardComponent,
 *     VendorManagementSuiteComponent,
 *     FulfillmentSystemComponent
 *   ]
 * })
 * export class DashboardComponent {}
 */
