import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function AdminPanel() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [bookingStats, setBookingStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('sales');
  const [selectedEvent, setSelectedEvent] = useState('');

  useEffect(() => {
    if (user?.role !== 'admin') return;
    Promise.all([
      api.get('/users').then((r) => setUsers(r.data.data || [])).catch(() => setUsers([])),
      api.get('/events/admin/all').then((r) => setEvents(r.data.data || [])).catch(() => setEvents([])),
      api.get('/bookings/admin/all').then((r) => {
        setBookings(r.data.data || []);
        setBookingStats(r.data.stats || null);
      }).catch(() => setBookings([])),
    ]).finally(() => setLoading(false));
  }, [user?.role]);

  const filterBookings = () => {
    if (!selectedEvent) return bookings;
    return bookings.filter(b => b.event?._id === selectedEvent);
  };

  const handleApprove = async (eventId) => {
    try {
      await api.patch(`/events/${eventId}/approve`);
      toast.success('Event approved');
      setEvents((prev) => prev.map((e) => (e._id === eventId ? { ...e, approvedByAdmin: true, status: 'published' } : e)));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="mx-auto max-w-md px-4 py-12 text-center">
        <p className="text-gray-500">Access denied. Admin only.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
      <p className="mt-1 text-gray-600">Manage users and events</p>

      <div className="mt-6 flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('sales')}
          className={`border-b-2 px-4 py-2 font-medium ${
            activeTab === 'sales' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-600'
          }`}
        >
          Sales & Bookings
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={`border-b-2 px-4 py-2 font-medium ${
            activeTab === 'events' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-600'
          }`}
        >
          Events
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`border-b-2 px-4 py-2 font-medium ${
            activeTab === 'users' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-600'
          }`}
        >
          Users
        </button>
      </div>

      {activeTab === 'sales' && (
        <div className="mt-6">
          {/* Stats Cards */}
          {bookingStats && (
            <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg bg-white p-4 shadow-sm border border-gray-200">
                <p className="text-sm font-medium text-gray-500">Total Tickets Sold</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{bookingStats.totalTicketsSold}</p>
              </div>
              <div className="rounded-lg bg-white p-4 shadow-sm border border-gray-200">
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <p className="mt-1 text-2xl font-bold text-green-600">₹{bookingStats.totalRevenue?.toLocaleString()}</p>
              </div>
              <div className="rounded-lg bg-white p-4 shadow-sm border border-gray-200">
                <p className="text-sm font-medium text-gray-500">Confirmed Bookings</p>
                <p className="mt-1 text-2xl font-bold text-blue-600">{bookingStats.confirmedBookings}</p>
              </div>
              <div className="rounded-lg bg-white p-4 shadow-sm border border-gray-200">
                <p className="text-sm font-medium text-gray-500">Checked In</p>
                <p className="mt-1 text-2xl font-bold text-purple-600">{bookingStats.checkedInCount}</p>
              </div>
            </div>
          )}

          {/* Filter */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Event</label>
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="w-full max-w-xs rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="">All Events</option>
              {events.map((event) => (
                <option key={event._id} value={event._id}>{event.title}</option>
              ))}
            </select>
          </div>

          {/* Bookings Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Booking ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Buyer Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Event</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Ticket Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Qty</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Check-In</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Booked On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filterBookings().length === 0 ? (
                  <tr>
                    <td colSpan="10" className="px-4 py-8 text-center text-gray-500">No bookings found</td>
                  </tr>
                ) : (
                  filterBookings().map((booking) => (
                    <tr key={booking._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-600 font-mono">
                        {booking._id.slice(-8).toUpperCase()}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">{booking.user?.name || 'N/A'}</td>
                      <td className="px-4 py-3 text-gray-600">{booking.user?.email || 'N/A'}</td>
                      <td className="px-4 py-3 text-gray-900">{booking.event?.title || 'N/A'}</td>
                      <td className="px-4 py-3 text-gray-600">{booking.ticketType?.name}</td>
                      <td className="px-4 py-3 text-center text-gray-900 font-medium">{booking.quantity}</td>
                      <td className="px-4 py-3 text-green-600 font-medium">₹{booking.totalAmount?.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          booking.status === 'refunded' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {booking.checkedIn ? (
                          <span className="inline-flex items-center gap-1 text-green-600">
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-xs">
                              {new Date(booking.checkedInAt).toLocaleTimeString()}
                            </span>
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">Not yet</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(booking.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Summary Footer */}
          {filterBookings().length > 0 && (
            <div className="mt-4 flex items-center justify-between rounded-lg bg-gray-50 p-4">
              <span className="text-sm text-gray-600">
                Showing {filterBookings().length} booking(s)
              </span>
              <span className="text-sm font-medium text-gray-900">
                Total: ₹{filterBookings().filter(b => b.status === 'confirmed').reduce((sum, b) => sum + b.totalAmount, 0).toLocaleString()}
              </span>
            </div>
          )}
        </div>
      )}

      {activeTab === 'events' && (
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Event</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Organizer</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Approved</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {events.map((event) => (
                <tr key={event._id}>
                  <td className="px-4 py-3 font-medium text-gray-900">{event.title}</td>
                  <td className="px-4 py-3 text-gray-600">{event.organizer?.name}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      event.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {event.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">{event.approvedByAdmin ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-3 text-right">
                    <Link to={`/events/${event._id}`} className="text-primary-600 hover:underline">View</Link>
                    {!event.approvedByAdmin && (
                      <>
                        {' · '}
                        <button
                          onClick={() => handleApprove(event._id)}
                          className="text-primary-600 hover:underline"
                        >
                          Approve
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((u) => (
                <tr key={u._id}>
                  <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                  <td className="px-4 py-3 text-gray-600">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700">
                      {u.role}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
