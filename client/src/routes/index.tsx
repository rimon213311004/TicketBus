import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { HomePage } from '@/pages/HomePage';
import { SearchResultsPage } from '@/pages/SearchResultsPage';
import { DestinationsPage } from '@/pages/DestinationsPage';
import { SeatSelectionPage } from '@/pages/SeatSelectionPage';
import { PassengerDetailsPage } from '@/pages/PassengerDetailsPage';
import { PaymentPage } from '@/pages/PaymentPage';
import { BookingSuccessPage } from '@/pages/BookingSuccessPage';
import { MyTicketsPage } from '@/pages/MyTicketsPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { AboutPage } from '@/pages/AboutPage';
import { ContactPage } from '@/pages/ContactPage';
import { FaqPage } from '@/pages/FaqPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { SettingsPage } from '@/pages/SettingsPage';
import { AdminPage } from '@/pages/AdminPage';
import { PlaceholderPage, NotFoundPage } from '@/pages/PlaceholderPage';
import type { UserRole } from '@/types';

const protectedRoute = (element: React.ReactNode, roles?: UserRole[]) => (
  <ProtectedRoute roles={roles}>{element}</ProtectedRoute>
);

export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/search', element: <SearchResultsPage /> },
      { path: '/destinations', element: <DestinationsPage /> },
      { path: '/trips/:tripId/seats', element: <SeatSelectionPage /> },
      { path: '/trips/:tripId/passengers', element: protectedRoute(<PassengerDetailsPage />) },
      { path: '/bookings/:bookingId/payment', element: protectedRoute(<PaymentPage />) },
      { path: '/bookings/:bookingId/success', element: protectedRoute(<BookingSuccessPage />) },
      { path: '/my-tickets', element: protectedRoute(<MyTicketsPage />) },
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },

      { path: '/about', element: <AboutPage /> },
      { path: '/contact', element: <ContactPage /> },
      { path: '/faq', element: <FaqPage /> },
      { path: '/profile', element: protectedRoute(<ProfilePage />) },
      { path: '/settings', element: protectedRoute(<SettingsPage />) },
      { path: '/admin', element: protectedRoute(<AdminPage />, ['admin']) },

      {
        path: '/wallet',
        element: protectedRoute(
          <PlaceholderPage
            title="Wallet"
            body="Stored balance and refunds to wallet are not part of this build. Pay with bKash, Nagad, Rocket, bank transfer or cash at the counter."
          />,
        ),
      },
      {
        path: '/reviews',
        element: protectedRoute(
          <PlaceholderPage
            title="Reviews"
            body="Operator ratings are shown on search results today. Writing and moderating reviews arrives in a later round."
          />,
        ),
      },
      {
        path: '/operator',
        element: protectedRoute(
          <PlaceholderPage
            title="Operator dashboard"
            body="Self-service trip and fleet management for operators arrives in a later round."
          />,
          ['operator', 'admin'],
        ),
      },

      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
