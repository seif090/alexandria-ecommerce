import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { ReviewService } from '../../services/review.service';
import { NotificationService } from '../../services/notification.service';
import { HttpClientModule } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HttpClientModule, RouterLink, FormsModule, TranslateModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  products: any[] = [];
  leaderboard: any[] = [];
  searchQuery: string = '';
  selectedCategory: string = '';
  minDiscount: number = 0;
  
  // Visual Search state
  isVisualSearchLoading = false;
  visualSearchImageUrl = '';
  visualSearchResults: any[] = [];

  // Recommendations state
  recommendations: any[] = [];
  isLoadingRecommendations = false;

  // Real-time Notification
  currentNotification: any = null;

  // Reviews state
  showReviewModal = false;
  selectedProduct: any = null;
  newReview = { rating: 5, comment: '' };

  categories = [
    { name: 'Fashion', icon: '👕' },
    { name: 'Grocery', icon: '🛒' },
    { name: 'Electronics', icon: '📱' },
    { name: 'Restaurants', icon: '🍽️' },
    { name: 'Pharmacy', icon: '💊' },
    { name: 'Shoes', icon: '👟' }
  ];

  constructor(
    private productService: ProductService, 
    public cartService: CartService,
    private reviewService: ReviewService,
    private notificationService: NotificationService,
    private analyticsService: AnalyticsService
  ) {}

  ngOnInit(): void {
    this.fetchDeals();
    this.setupNotifications();
    this.loadLeaderboard();
    this.loadRecommendations();
  }

  loadRecommendations() {
    this.isLoadingRecommendations = true;
    this.analyticsService.getRecommendations().subscribe({
      next: (data) => {
        this.recommendations = data.recommendations || [];
        this.isLoadingRecommendations = false;
      },
      error: () => this.isLoadingRecommendations = false
    });
  }

  loadLeaderboard() {
    this.analyticsService.getLeaderboard().subscribe(data => this.leaderboard = data);
  }

  setupNotifications() {
    this.notificationService.getNewDealNotifications().subscribe(data => {
      this.currentNotification = data;
      setTimeout(() => this.currentNotification = null, 5000);
    });
  }

  fetchDeals(): void {
    this.productService.getProducts(this.selectedCategory, this.searchQuery, this.minDiscount).subscribe({
      next: (data) => this.products = data,
      error: (err) => console.log('Error fetching products', err)
    });
  }

  openReview(product: any) {
    this.selectedProduct = product;
    this.showReviewModal = true;
    this.newReview = { rating: 5, comment: '' };
    // Fetch existing reviews
    this.reviewService.getReviews(product._id).subscribe(data => {
      this.selectedProduct.reviews = data;
    });
  }

  submitReview() {
    this.reviewService.addReview({
      product: this.selectedProduct._id,
      rating: this.newReview.rating,
      comment: this.newReview.comment
    }).subscribe(() => {
      this.openReview(this.selectedProduct); // Refresh
      this.newReview = { rating: 5, comment: '' };
    });
  }

  addToCart(product: any): void {
    this.cartService.addToCart(product);
  }

  fetchDeals(): void {
    this.productService.getProducts(this.selectedCategory, this.searchQuery, this.minDiscount).subscribe({
      next: (data) => this.products = data,
      error: (err) => console.log('Error fetching products', err)
    });
  }

  selectCategory(name: string): void {
    this.selectedCategory = this.selectedCategory === name ? '' : name;
    this.fetchDeals();
  }

  onSearchChange(): void {
    this.fetchDeals();
  }

  getDiscountPercentage(original: number, discount: number): number {
    return Math.round(((original - discount) / original) * 100);
  }

  getRemainingTime(expiryDate: any): string {
    if (!expiryDate) return '';
    const now = new Date().getTime();
    const expiry = new Date(expiryDate).getTime();
    const diff = expiry - now;

    if (diff <= 0) return 'Expired';

    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m left`;
  }

  // --- Visual Search Methods ---
  triggerVisualSearch(url: string) {
    if (!url) return;
    this.isVisualSearchLoading = true;
    this.visualSearchImageUrl = url;
    this.productService.visualSearch(url).subscribe({
      next: (res) => {
        this.visualSearchResults = res.matches;
        this.isVisualSearchLoading = false;
        // Optional: Scroll to results
      },
      error: () => this.isVisualSearchLoading = false
    });
  }

  clearVisualSearch() {
    this.visualSearchResults = [];
    this.visualSearchImageUrl = '';
  }
}
