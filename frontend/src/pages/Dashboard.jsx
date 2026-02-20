import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [myEvents, setMyEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const promises = [];
    if (user?.role === 'organizer' || user?.role === 'admin') {
      promises.push(api.get('/events/organizer/my').then((r) => setMyEvents(r.data.data || [])));
    }
    promises.push(api.get('/bookings').then((r) => setBookings(r.data.data || [])));
    Promise.all(promises).finally(() => setLoading(false));
  }, [user?.role]);

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '');

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  const isOrganizer = user?.role === 'organizer' || user?.role === 'admin';

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p className="mt-1 text-gray-600">Welcome back, {user?.name}</p>

      {isOrganizer && (
        <section className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">My Events</h2>
            <Link to="/events/create" className="btn-primary">Create event</Link>
          </div>
          {myEvents.length === 0 ? (
            <p className="mt-4 text-gray-500">You haven&apos;t created any events yet.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Event</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Tickets Sold</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {myEvents.slice(0, 10).map((event) => {
                    const ticketsSold = event.ticketTypes?.reduce((sum, t) => sum + (t.sold || 0), 0) || 0;
                    const totalCapacity = event.ticketTypes?.reduce((sum, t) => sum + (t.quantity || 0), 0) || 0;
                    return (
                      <tr key={event._id}>
                        <td className="px-4 py-3 font-medium text-gray-900">{event.title}</td>
                        <td className="px-4 py-3 text-gray-600">{formatDate(event.date)}</td>
                        <td className="px-4 py-3">
                          <span className="font-medium text-blue-600">{ticketsSold}</span>
                          <span className="text-gray-400"> / {totalCapacity}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            event.status === 'published' ? 'bg-green-100 text-green-800' :
                            event.status === 'draft' ? 'bg-gray-100 text-gray-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {event.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link to={`/events/${event._id}`} className="text-primary-600 hover:underline">View</Link>
                          {' · '}
                          <Link to={`/events/edit/${event._id}`} className="text-primary-600 hover:underline">Edit</Link>
                          {' · '}
                          <Link to={`/events/${event._id}/sales`} className="text-green-600 hover:underline">Sales</Link>
                          {' · '}
                          <Link to={`/events/${event._id}/scanner`} className="text-purple-600 hover:underline">Scan</Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900">My Bookings</h2>
        {bookings.length === 0 ? (
          <p className="mt-4 text-gray-500">No bookings yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {bookings.slice(0, 10).map((b) => (
              <Link
                key={b._id}
                to={`/bookings/${b._id}/confirmation`}
                className="card flex items-center justify-between p-4 transition hover:shadow-md"
              >
                <div>
                  <p className="font-medium text-gray-900">{b.event?.title}</p>
                  <p className="text-sm text-gray-500">{formatDate(b.event?.date)} · {b.quantity} ticket(s) · ₹{b.totalAmount}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  b.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {b.status}
                </span>
              </Link>
            ))}
          </div>
        )}
        {bookings.length > 0 && (
          <Link to="/bookings" className="mt-4 inline-block text-primary-600 hover:underline">View all bookings →</Link>
        )}
      </section>
    </div>
  );
}
