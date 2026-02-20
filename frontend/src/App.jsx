import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicOnlyRoute from './components/auth/PublicOnlyRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import BookingCheckout from './pages/BookingCheckout';
import BookingConfirmation from './pages/BookingConfirmation';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import CreateEvent from './pages/CreateEvent';
import EditEvent from './pages/EditEvent';
import EventSales from './pages/EventSales';
import TicketScanner from './pages/TicketScanner';
import MyBookings from './pages/MyBookings';
import AdminPanel from './pages/AdminPanel';
import About from './pages/About';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Refunds from './pages/Refunds';
import Support from './pages/Support';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="events" element={<Events />} />
        <Route path="events/:id" element={<EventDetail />} />
        <Route path="about" element={<About />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="terms" element={<Terms />} />
        <Route path="refunds" element={<Refunds />} />
        <Route path="support" element={<Support />} />

        <Route element={<PublicOnlyRoute />}>
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="bookings" element={<MyBookings />} />
          <Route path="events/:id/checkout" element={<BookingCheckout />} />
          <Route path="bookings/:id/confirmation" element={<BookingConfirmation />} />
          <Route path="events/create" element={<CreateEvent />} />
          <Route path="events/edit/:id" element={<EditEvent />} />
          <Route path="events/:eventId/sales" element={<EventSales />} />
          <Route path="events/:eventId/scanner" element={<TicketScanner />} />
          <Route path="admin" element={<AdminPanel />} />
        </Route>

        <Route path="404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Route>
    </Routes>
  );
}
