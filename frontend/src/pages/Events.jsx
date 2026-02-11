import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api, { API_URL } from '../api/axios';

const CATEGORIES = ['conference', 'workshop', 'concert', 'meetup', 'sports', 'webinar', 'festival', 'other'];

export default function Events() {
  const [events, setEvents] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    const params = { page, limit: 12 };
    if (search) params.search = search;
    if (category) params.category = category;
    api
      .get('/events', { params })
      .then((res) => {
        setEvents(res.data.data || []);
        setPagination(res.data.pagination || { page: 1, limit: 12, total: 0, pages: 0 });
      })
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, [page, search, category]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setLoading(true);
    const params = { page: 1, limit: 12 };
    if (search) params.search = search;
    if (category) params.category = category;
    api
      .get('/events', { params })
      .then((res) => {
        setEvents(res.data.data || []);
        setPagination(res.data.pagination || { page: 1, limit: 12, total: 0, pages: 0 });
      })
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  };

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '');

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900">Events</h1>
      <p className="mt-1 text-gray-600">Browse and book events</p>

      <form onSubmit={handleSearch} className="mt-6 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search events..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field max-w-xs flex-1"
        />
        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          className="input-field w-40"
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <button type="submit" className="btn-primary">Search</button>
      </form>

      {loading ? (
        <div className="mt-12 flex justify-center py-12">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
        </div>
      ) : events.length === 0 ? (
        <p className="mt-12 text-center text-gray-500">No events found.</p>
      ) : (
        <>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {events.map((event) => (
              <Link
                key={event._id}
                to={`/events/${event._id}`}
                className="card overflow-hidden transition hover:shadow-md"
              >
                <div className="h-44 bg-gray-200">
                  {event.images?.[0] ? (
                    <img src={event.images[0].startsWith('http') ? event.images[0] : `${API_URL}${event.images[0]}`} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-4xl text-gray-400">🎫</div>
                  )}
                </div>
                <div className="p-4">
                  <span className="text-xs font-medium uppercase text-primary-600">{event.category}</span>
                  <h3 className="mt-1 font-semibold text-gray-900 line-clamp-2">{event.title}</h3>
                  <p className="mt-1 text-sm text-gray-500">{formatDate(event.date)} • {event.venue}</p>
                  {event.ticketTypes?.[0] && (
                    <p className="mt-1 text-sm font-medium text-gray-700">
                      From ₹{event.ticketTypes[0].price}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
          {pagination.pages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="btn-secondary disabled:opacity-50"
              >
                Previous
              </button>
              <span className="flex items-center px-4 text-sm text-gray-600">
                Page {page} of {pagination.pages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                disabled={page >= pagination.pages}
                className="btn-secondary disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
