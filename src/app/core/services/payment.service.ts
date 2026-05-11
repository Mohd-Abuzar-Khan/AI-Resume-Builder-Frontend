import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

declare var Razorpay: any;

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = `${environment.apiBaseUrl}/auth/payment`;

  constructor(private http: HttpClient) {}

  createOrder(userId: number, amount: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/create-order?userId=${userId}`, { amount });
  }

  verifyPayment(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify`, payload);
  }

  getPaymentHistory(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/history/${userId}`);
  }

  initiateRazorpay(options: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const rzp = new Razorpay({
        ...options,
        handler: (response: any) => {
          resolve(response);
        },
        modal: {
          ondismiss: () => {
            reject('dismissed');
          }
        }
      });
      rzp.open();
    });
  }
  
  loadRazorpayScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if ((window as any).Razorpay) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve();
      script.onerror = () => reject();
      document.body.appendChild(script);
    });
  }
}
