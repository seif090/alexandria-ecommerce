/**
 * Premium Membership Components Barrel Export
 * 
 * This file provides a centralized export point for all membership components
 * making it easier to import them in your application.
 */

export { MembershipShowcaseComponent } from './membership-showcase.component';
export { PremiumBenefitsCardComponent } from './premium-benefits-card.component';
export { RewardsDashboardComponent } from './rewards-dashboard.component';
export { TierUpgradeCardComponent } from './tier-upgrade-card.component';
export { MembershipStatsWidgetComponent } from './membership-stats-widget.component';
export { SubscriptionPlanCardComponent } from './subscription-plan-card.component';

/**
 * Quick Import Examples:
 * 
 * // Import all components
 * import {
 *   MembershipShowcaseComponent,
 *   PremiumBenefitsCardComponent,
 *   RewardsDashboardComponent,
 *   TierUpgradeCardComponent,
 *   MembershipStatsWidgetComponent,
 *   SubscriptionPlanCardComponent
 * } from './components/membership';
 * 
 * // Use in your component
 * @Component({
 *   imports: [
 *     MembershipShowcaseComponent,
 *     RewardsDashboardComponent,
 *     // ... other components
 *   ]
 * })
 * export class MembershipPageComponent {}
 */
