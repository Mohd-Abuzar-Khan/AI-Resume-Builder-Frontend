import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { premiumGuard } from './core/guards/premium.guard';
import { AuthenticatedLayoutComponent } from './layouts/authenticated-layout';
import { AdminLayoutComponent } from './layouts/admin-layout';
import { JobsPageComponent } from './pages/jobs-page';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',   // ← FIX: prevents this from swallowing all child routes
    loadComponent: () => import('./pages/index-page').then((m) => m.IndexComponent),
  },
  {
    path: 'explore',
    loadComponent: () => import('./pages/explore-page').then((m) => m.ExploreComponent),
  },

  {
    path: 'pricing',
    loadComponent: () => import('./pages/pricing-page').then((m) => m.PricingComponent),
  },
  {
    path: 'community',
    loadComponent: () => import('./pages/community-page').then((m) => m.CommunityComponent),
  },
  {
    path: 'community/resume/:id',
    loadComponent: () => import('./pages/public-resume-preview').then(m => m.PublicResumePreviewComponent),
  },
  // Auth routes
  {
    path: 'auth/login',
    loadComponent: () => import('./pages/auth/login-page').then((m) => m.LoginComponent),
  },
  {
    path: 'auth/register',
    loadComponent: () => import('./pages/auth/register-page').then((m) => m.RegisterComponent),
  },
  {
    path: 'auth/google',
    loadComponent: () => import('./pages/auth/google-callback').then((m) => m.GoogleCallbackComponent),
  },
  // Backwards compatibility
  {
    path: 'signin',
    redirectTo: 'auth/login',
    pathMatch: 'full',
  },

  // Authenticated routes with sidebar layout
  {
    path: '',
    component: AuthenticatedLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard-page').then((m) => m.DashboardComponent),
      },
      {
        path: 'resumes',
        loadComponent: () => import('./pages/dashboard/dashboard-page').then((m) => m.DashboardComponent),
      },
      {
        path: 'job-matching',
        component: JobsPageComponent,
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/profile-page').then((m) => m.ProfilePageComponent),
      },
      {
        path: 'billing',
        loadComponent: () => import('./pages/billing-page').then(m => m.BillingPageComponent),
      },
      {
        path: 'payment',
        loadComponent: () => import('./pages/payment-page').then(m => m.PaymentPageComponent),
      },
      {
        path: 'ats-audit',
        loadComponent: () => import('./pages/ats-audit-page').then(m => m.AtsAuditPageComponent),
      },
      {
        path: 'tailor-resume',
        loadComponent: () => import('./pages/tailor-resume-page').then(m => m.TailorResumePageComponent),
      },
      {
        path: 'cover-letter',
        loadComponent: () => import('./pages/cover-letter-page').then(m => m.CoverLetterPageComponent),
      },
    ]
  },

  // Admin Routes
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [roleGuard('ADMIN')],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/admin/dashboard').then((m) => m.AdminDashboardComponent),
      },
      {
        path: 'users',
        loadComponent: () => import('./pages/admin/users').then((m) => m.AdminUsersComponent),
      },
      {
        path: 'broadcast',
        loadComponent: () => import('./pages/admin/broadcast').then((m) => m.SendNotificationComponent),
      },
      {
        path: 'templates',
        loadComponent: () => import('./pages/admin/admin-templates-page').then((m) => m.AdminTemplatesComponent),
      },
      {
        path: 'ai-test',
        loadComponent: () => import('./pages/admin/ai-test-page').then((m) => m.AiTestPageComponent),
      },
      {
        path: 'payments',
        loadComponent: () => import('./pages/admin/payments').then((m) => m.AdminPaymentsComponent),
      },
    ],
  },

  // Builder routes (Phase 3) - Usually standalone for focus
  {
    path: 'builder/:resumeId',
    loadComponent: () => import('./pages/builder/live-builder-page').then((m) => m.LiveBuilderComponent),
    canActivate: [authGuard],
  },

  {
    path: '**',
    loadComponent: () => import('./pages/not-found-page').then((m) => m.NotFoundComponent),
  },
];
