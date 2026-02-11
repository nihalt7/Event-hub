import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/bookings')
      .then((res) => setBookings(res.data.data || []))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await api.patch(`/bookings/${id}/cancel`);
      toast.success('Booking cancelled');
      setBookings((prev) => prev.map((b) => (b._id === id ? { ...b, status: 'cancelled' } : b)));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancel failed');
    }
  };

  const formatDate = (d) => (d ? new Date(d).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' }) : '');

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
      <p className="mt-1 text-gray-600">View and manage your tickets</p>
      {bookings.length === 0 ? (
        <p className="mt-8 text-gray-500">No bookings yet.</p>
      ) : (
        <div className="mt-8 space-y-4">
          {bookings.map((b) => (
            <div key={b._id} className="card flex flex-wrap items-center justify-between gap-4 p-4">
              <div className="flex-1 min-w-0">
                <Link to={`/events/${b.event?._id}`} className="font-medium text-gray-900 hover:text-primary-600">
                  {b.event?.title}
                </Link>
                <p className="text-sm text-gray-500">{formatDate(b.event?.date)}</p>
                <p className="text-sm text-gray-600">
                  {b.quantity} × {b.ticketType?.name} · ₹{b.totalAmount}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  b.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                  b.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {b.status}
                </span>
                <Link to={`/bookings/${b._id}/confirmation`} className="btn-secondary text-sm">
                  View
                </Link>
                {b.status === 'confirmed' && (
                  <button
                    onClick={() => handleCancel(b._id)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
