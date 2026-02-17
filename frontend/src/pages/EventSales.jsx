import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';

export default function EventSales() {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [revenue, setRevenue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventRes, bookingsRes] = await Promise.all([
          api.get(`/events/${eventId}`),
          api.get(`/bookings/event/${eventId}`),
        ]);
        setEvent(eventRes.data.event);
        setBookings(bookingsRes.data.data || []);
        setRevenue(bookingsRes.data.revenue || 0);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [eventId]);

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';

  const formatTime = (d) =>
    d ? new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '';

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  const totalTickets = bookings.reduce((sum, b) => sum + b.quantity, 0);
  const checkedInCount = bookings.filter((b) => b.checkedIn).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <Link to="/dashboard" className="text-primary-600 hover:underline text-sm">
            ← Back to Dashboard
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">
            Sales & Attendees
          </h1>
          {event && (
            <p className="mt-1 text-gray-600">
              {event.title} · {formatDate(event.date)}
            </p>
          )}
        </div>
        <Link
          to={`/events/${eventId}/scanner`}
          className="btn-primary flex items-center gap-2"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
          Scan Tickets
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-white p-4 shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-500">Total Bookings</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{bookings.length}</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-500">Tickets Sold</p>
          <p className="mt-1 text-2xl font-bold text-blue-600">{totalTickets}</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-500">Total Revenue</p>
          <p className="mt-1 text-2xl font-bold text-green-600">₹{revenue.toLocaleString()}</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-500">Checked In</p>
          <p className="mt-1 text-2xl font-bold text-purple-600">
            {checkedInCount} / {bookings.length}
          </p>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-4 py-3">
          <h2 className="font-semibold text-gray-900">Buyer Details</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  #
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Buyer Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Ticket Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Qty
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Check-In
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Booked On
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
                    No bookings yet for this event
                  </td>
                </tr>
              ) : (
                bookings.map((booking, index) => (
                  <tr key={booking._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-500">{index + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {booking.user?.name || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{booking.user?.email || 'N/A'}</td>
                    <td className="px-4 py-3 text-gray-600">{booking.ticketType?.name}</td>
                    <td className="px-4 py-3 text-center font-medium text-gray-900">
                      {booking.quantity}
                    </td>
                    <td className="px-4 py-3 font-medium text-green-600">
                      ₹{booking.totalAmount?.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          booking.status === 'confirmed'
                            ? 'bg-green-100 text-green-800'
                            : booking.status === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {booking.checkedIn ? (
                        <span className="inline-flex items-center gap-1 text-green-600">
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-xs">{formatTime(booking.checkedInAt)}</span>
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">Not yet</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatDate(booking.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export note */}
      {bookings.length > 0 && (
        <div className="mt-4 text-sm text-gray-500">
          Total {bookings.length} booking(s) · {totalTickets} ticket(s) · ₹{revenue.toLocaleString()} revenue
        </div>
      )}
    </div>
  );
}
