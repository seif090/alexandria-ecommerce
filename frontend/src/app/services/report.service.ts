import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private apiUrl = 'http://localhost:3000/api/reports';

  constructor(private http: HttpClient) { }

  // Get sales report
  getSalesReport(startDate: string, endDate: string): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.get<any>(`${this.apiUrl}/sales?startDate=${startDate}&endDate=${endDate}`, {
      headers: { 'x-auth-token': token || '' }
    });
  }

  // Get inventory report
  getInventoryReport(): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.get<any>(`${this.apiUrl}/inventory`, {
      headers: { 'x-auth-token': token || '' }
    });
  }

  // Get customer analytics
  getCustomerAnalytics(startDate?: string, endDate?: string): Observable<any> {
    const token = localStorage.getItem('token');
    let url = `${this.apiUrl}/customers`;
    if (startDate && endDate) {
      url += `?startDate=${startDate}&endDate=${endDate}`;
    }
    return this.http.get<any>(url, {
      headers: { 'x-auth-token': token || '' }
    });
  }

  // Export to PDF
  exportToPDF(reportType: string, filters?: any): Observable<Blob> {
    const token = localStorage.getItem('token');
    return this.http.post<Blob>(`${this.apiUrl}/export/pdf`, { reportType, filters }, {
      headers: { 'x-auth-token': token || '' },
      responseType: 'blob' as 'json'
    }).pipe(
      tap((blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${reportType}-${new Date().getTime()}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      })
    );
  }

  // Export to Excel
  exportToExcel(reportType: string, filters?: any): Observable<Blob> {
    const token = localStorage.getItem('token');
    return this.http.post<Blob>(`${this.apiUrl}/export/excel`, { reportType, filters }, {
      headers: { 'x-auth-token': token || '' },
      responseType: 'blob' as 'json'
    }).pipe(
      tap((blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${reportType}-${new Date().getTime()}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);
      })
    );
  }

  // Export to CSV
  exportToCSV(reportType: string, filters?: any): Observable<Blob> {
    const token = localStorage.getItem('token');
    return this.http.post<Blob>(`${this.apiUrl}/export/csv`, { reportType, filters }, {
      headers: { 'x-auth-token': token || '' },
      responseType: 'blob' as 'json'
    }).pipe(
      tap((blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${reportType}-${new Date().getTime()}.csv`;
        link.click();
        window.URL.revokeObjectURL(url);
      })
    );
  }

  // Generate custom report
  generateCustomReport(config: {
    title: string;
    metrics: string[];
    filters?: any;
    format: 'pdf' | 'excel' | 'csv';
    dateRange?: { start: string; end: string };
  }): Observable<Blob> {
    const token = localStorage.getItem('token');
    return this.http.post<Blob>(`${this.apiUrl}/custom`, config, {
      headers: { 'x-auth-token': token || '' },
      responseType: 'blob' as 'json'
    }).pipe(
      tap((blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const ext = config.format === 'excel' ? 'xlsx' : config.format;
        link.download = `${config.title}-${new Date().getTime()}.${ext}`;
        link.click();
        window.URL.revokeObjectURL(url);
      })
    );
  }

  // Get report templates
  getReportTemplates(): Observable<any[]> {
    const token = localStorage.getItem('token');
    return this.http.get<any[]>(`${this.apiUrl}/templates`, {
      headers: { 'x-auth-token': token || '' }
    });
  }

  // Schedule report delivery
  scheduleReport(config: {
    reportType: string;
    frequency: 'daily' | 'weekly' | 'monthly';
    format: 'pdf' | 'excel' | 'csv';
    recipients: string[];
    filters?: any;
  }): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.post<any>(`${this.apiUrl}/schedule`, config, {
      headers: { 'x-auth-token': token || '' }
    });
  }

  // Get scheduled reports
  getScheduledReports(): Observable<any[]> {
    const token = localStorage.getItem('token');
    return this.http.get<any[]>(`${this.apiUrl}/scheduled`, {
      headers: { 'x-auth-token': token || '' }
    });
  }

  // Delete scheduled report
  deleteScheduledReport(reportId: string): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.delete<any>(`${this.apiUrl}/scheduled/${reportId}`, {
      headers: { 'x-auth-token': token || '' }
    });
  }
}
