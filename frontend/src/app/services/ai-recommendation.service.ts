import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

/**
 * Recommendation Strategy Types
 */
export enum RecommendationStrategy {
  COLLABORATIVE_FILTERING = 'collaborative_filtering',
  CONTENT_BASED = 'content_based',
  POPULARITY = 'popularity',
  TRENDING = 'trending',
  PERSONALIZED = 'personalized',
  SEASONAL = 'seasonal'
}

/**
 * Product Recommendation
 */
export interface ProductRecommendation {
  productId: string;
  name: string;
  price: number;
  rating: number;
  image: string;
  matchScore: number; // 0-100 relevance score
  reason: string;
  category: string;
  strategy: RecommendationStrategy;
}

/**
 * User Preference Profile
 */
export interface UserPreferenceProfile {
  userId: string;
  categories: Map<string, number>; // category -> interest score
  priceRange: { min: number; max: number };
  brands: Map<string, number>; // brand -> preference
  keywords: string[];
  seasonalPreferences: Map<string, number>; // season -> interest
  lastUpdated: Date;
}

/**
 * Trend Analysis
 */
export interface TrendData {
  category: string;
  trend: 'rising' | 'stable' | 'declining';
  velocity: number; // Rate of change
  momentum: number; // Strong interest signals
  forecasted: string[]; // Suggested next searches
}

/**
 * Recommendation Session
 */
export interface RecommendationSession {
  sessionId: string;
  userId: string;
  strategy: RecommendationStrategy;
  recommendations: ProductRecommendation[];
  generatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class AIRecommendationService {
  private apiUrl = 'http://localhost:3000/api';

  private recommendations$ = new BehaviorSubject<ProductRecommendation[]>([]);
  private userProfile$ = new BehaviorSubject<UserPreferenceProfile | null>(null);
  private trendData$ = new BehaviorSubject<TrendData[]>([]);
  private currentSession$ = new BehaviorSubject<RecommendationSession | null>(null);

  // AI Model configurations
  private readonly strategies = {
    [RecommendationStrategy.COLLABORATIVE_FILTERING]: {
      weight: 0.3,
      description: 'Users like you also bought...',
      useNeighbors: true
    },
    [RecommendationStrategy.CONTENT_BASED]: {
      weight: 0.25,
      description: 'Based on items you liked...',
      useAttributes: true
    },
    [RecommendationStrategy.POPULARITY]: {
      weight: 0.2,
      description: 'Trending in your category...',
      useTrends: true
    },
    [RecommendationStrategy.TRENDING]: {
      weight: 0.15,
      description: 'Rising in popularity...',
      useVelocity: true
    },
    [RecommendationStrategy.PERSONALIZED]: {
      weight: 0.05,
      description: 'Just for you...',
      useML: true
    },
    [RecommendationStrategy.SEASONAL]: {
      weight: 0.05,
      description: 'Perfect for this season...',
      useSeasonal: true
    }
  };

  constructor(private http: HttpClient) {
    this.initializeAI();
  }

  /**
   * Initialize AI recommendation engine
   */
  private initializeAI(): void {
    // Load user profile and trends
    this.loadUserProfile();
    this.loadTrendData();
  }

  /**
   * Get recommendations
   */
  getRecommendations(): Observable<ProductRecommendation[]> {
    return this.recommendations$.asObservable();
  }

  /**
   * Generate personalized recommendations
   */
  generateRecommendations(limit: number = 10): void {
    this.http.get<any>(`${this.apiUrl}/ai/recommendations?limit=${limit}`, {
      headers: { 'x-auth-token': localStorage.getItem('token') || '' }
    }).subscribe({
      next: (response) => {
        this.recommendations$.next(response.data);
        this.currentSession$.next({
          sessionId: this.generateSessionId(),
          userId: localStorage.getItem('userId') || '',
          strategy: RecommendationStrategy.PERSONALIZED,
          recommendations: response.data,
          generatedAt: new Date()
        });
      },
      error: (error) => console.error('Failed to generate recommendations:', error)
    });
  }

  /**
   * Generate recommendations by strategy
   */
  generateRecommendationsByStrategy(
    strategy: RecommendationStrategy,
    limit: number = 10
  ): Observable<ProductRecommendation[]> {
    return this.http.get<any>(
      `${this.apiUrl}/ai/recommendations/strategy/${strategy}?limit=${limit}`,
      { headers: { 'x-auth-token': localStorage.getItem('token') || '' } }
    );
  }

  /**
   * Get collaborative filtering recommendations
   * (Items bought by similar users)
   */
  getCollaborativeFiltering(limit: number = 10): Observable<ProductRecommendation[]> {
    return this.generateRecommendationsByStrategy(
      RecommendationStrategy.COLLABORATIVE_FILTERING,
      limit
    );
  }

  /**
   * Get content-based recommendations
   * (Similar to items you viewed)
   */
  getContentBased(limit: number = 10): Observable<ProductRecommendation[]> {
    return this.generateRecommendationsByStrategy(
      RecommendationStrategy.CONTENT_BASED,
      limit
    );
  }

  /**
   * Get trending recommendations
   */
  getTrendingRecommendations(limit: number = 10): Observable<ProductRecommendation[]> {
    return this.generateRecommendationsByStrategy(
      RecommendationStrategy.TRENDING,
      limit
    );
  }

  /**
   * Get seasonal recommendations
   */
  getSeasonalRecommendations(limit: number = 10): Observable<ProductRecommendation[]> {
    return this.generateRecommendationsByStrategy(
      RecommendationStrategy.SEASONAL,
      limit
    );
  }

  /**
   * Get category-specific recommendations
   */
  getCategoryRecommendations(category: string, limit: number = 10): Observable<ProductRecommendation[]> {
    return this.http.get<any>(
      `${this.apiUrl}/ai/recommendations/category/${category}?limit=${limit}`,
      { headers: { 'x-auth-token': localStorage.getItem('token') || '' } }
    );
  }

  /**
   * Get recommendations based on search query
   */
  getSearchBasedRecommendations(query: string, limit: number = 10): Observable<ProductRecommendation[]> {
    return this.http.get<any>(
      `${this.apiUrl}/ai/recommendations/search`,
      {
        params: { q: query, limit: limit.toString() },
        headers: { 'x-auth-token': localStorage.getItem('token') || '' }
      }
    );
  }

  /**
   * Get "You might also like" recommendations
   */
  getYouMightAlsoLike(productId: string, limit: number = 5): Observable<ProductRecommendation[]> {
    return this.http.get<any>(
      `${this.apiUrl}/ai/recommendations/also-like/${productId}?limit=${limit}`,
      { headers: { 'x-auth-token': localStorage.getItem('token') || '' } }
    );
  }

  /**
   * Load user preference profile
   */
  private loadUserProfile(): void {
    this.http.get<any>(`${this.apiUrl}/ai/user-profile`, {
      headers: { 'x-auth-token': localStorage.getItem('token') || '' }
    }).subscribe({
      next: (response) => {
        this.userProfile$.next(response.data);
      },
      error: (error) => console.error('Failed to load user profile:', error)
    });
  }

  /**
   * Get user preference profile
   */
  getUserProfile(): Observable<UserPreferenceProfile | null> {
    return this.userProfile$.asObservable();
  }

  /**
   * Update user preferences
   */
  updateUserPreferences(preferences: Partial<UserPreferenceProfile>): Observable<any> {
    return this.http.put(`${this.apiUrl}/ai/user-profile`, preferences, {
      headers: { 'x-auth-token': localStorage.getItem('token') || '' }
    });
  }

  /**
   * Track user interaction (view, click, purchase)
   */
  trackInteraction(interaction: {
    type: 'view' | 'click' | 'purchase' | 'add_to_cart' | 'remove_from_cart';
    productId: string;
    category?: string;
    timestamp?: Date;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/ai/track-interaction`, interaction, {
      headers: { 'x-auth-token': localStorage.getItem('token') || '' }
    });
  }

  /**
   * Load trend data
   */
  private loadTrendData(): void {
    this.http.get<any>(`${this.apiUrl}/ai/trends`, {
      headers: { 'x-auth-token': localStorage.getItem('token') || '' }
    }).subscribe({
      next: (response) => {
        this.trendData$.next(response.data);
      },
      error: (error) => console.error('Failed to load trend data:', error)
    });
  }

  /**
   * Get trend data
   */
  getTrendData(): Observable<TrendData[]> {
    return this.trendData$.asObservable();
  }

  /**
   * Get trending categories
   */
  getTrendingCategories(limit: number = 5): Observable<{ category: string; trend: number }[]> {
    return this.http.get<any>(`${this.apiUrl}/ai/trending-categories?limit=${limit}`, {
      headers: { 'x-auth-token': localStorage.getItem('token') || '' }
    });
  }

  /**
   * Get predict next search
   * Uses ML to suggest what user might search for next
   */
  predictNextSearch(): Observable<string[]> {
    return this.http.get<any>(`${this.apiUrl}/ai/predict-search`, {
      headers: { 'x-auth-token': localStorage.getItem('token') || '' }
    });
  }

  /**
   * Get personalization score
   * 0-100 score of how well recommendations match user
   */
  getPersonalizationScore(): Observable<number> {
    return this.http.get<any>(`${this.apiUrl}/ai/personalization-score`, {
      headers: { 'x-auth-token': localStorage.getItem('token') || '' }
    });
  }

  /**
   * A/B test recommendations
   * Compare two strategies
   */
  abTestRecommendations(
    strategyA: RecommendationStrategy,
    strategyB: RecommendationStrategy,
    limit: number = 10
  ): Observable<{
    strategyA: ProductRecommendation[];
    strategyB: ProductRecommendation[];
    winner?: RecommendationStrategy;
  }> {
    return this.http.get<any>(
      `${this.apiUrl}/ai/ab-test?strategyA=${strategyA}&strategyB=${strategyB}&limit=${limit}`,
      { headers: { 'x-auth-token': localStorage.getItem('token') || '' } }
    );
  }

  /**
   * Get strategy info
   */
  getStrategyInfo(strategy: RecommendationStrategy): any {
    return this.strategies[strategy];
  }

  /**
   * Clear recommendations
   */
  clearRecommendations(): void {
    this.recommendations$.next([]);
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get current session
   */
  getCurrentSession(): Observable<RecommendationSession | null> {
    return this.currentSession$.asObservable();
  }

  /**
   * Export interaction history
   */
  exportInteractionHistory(): Observable<any> {
    return this.http.get(`${this.apiUrl}/ai/interactions/export`, {
      headers: { 'x-auth-token': localStorage.getItem('token') || '' }
    });
  }

  /**
   * Reset AI profile (forget all interactions)
   */
  resetAIProfile(): Observable<any> {
    return this.http.post(`${this.apiUrl}/ai/reset-profile`, {}, {
      headers: { 'x-auth-token': localStorage.getItem('token') || '' }
    });
  }

  /**
   * Get recommendation explanation
   * Explains why a product was recommended
   */
  getRecommendationExplanation(productId: string): Observable<{
    productId: string;
    reasons: string[];
    matchScore: number;
    factors: { [key: string]: number };
  }> {
    return this.http.get<any>(
      `${this.apiUrl}/ai/recommendation-reason/${productId}`,
      { headers: { 'x-auth-token': localStorage.getItem('token') || '' } }
    );
  }
}
