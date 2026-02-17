import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api, { API_URL } from '../api/axios';

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/events/featured')
      .then((res) => setFeatured(res.data.data || []))
      .catch(() => setFeatured([]))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '');

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 to-primary-800 py-20 text-white">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Discover Events That Matter
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-100">
            Browse conferences, workshops, concerts, and more. Book tickets in seconds.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link to="/events" className="rounded-lg bg-white px-6 py-3 font-medium text-primary-700 shadow-lg hover:bg-primary-50">
              Browse Events
            </Link>
            <Link to="/signup" className="rounded-lg border-2 border-white px-6 py-3 font-medium hover:bg-white/10">
              Get Started
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900">Featured Events</h2>
        <p className="mt-1 text-gray-600">Hand-picked events you don&apos;t want to miss</p>
        {loading ? (
          <div className="mt-8 flex justify-center py-12">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
          </div>
        ) : featured.length === 0 ? (
          <p className="mt-8 text-gray-500">No featured events yet. Check back soon!</p>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((event) => (
              <Link
                key={event._id}
                to={`/events/${event._id}`}
                className="card overflow-hidden transition hover:shadow-md"
              >
                <div className="h-48 bg-gray-200">
                  {event.images?.[0] ? (
                    <img src={event.images[0].startsWith('http') ? event.images[0] : `${API_URL}${event.images[0]}`} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-4xl text-gray-400">🎫</div>
                  )}
                </div>
                <div className="p-4">
                  <span className="text-xs font-medium uppercase text-primary-600">{event.category}</span>
                  <h3 className="mt-1 font-semibold text-gray-900">{event.title}</h3>
                  <p className="mt-1 text-sm text-gray-500">{formatDate(event.date)} • {event.venue}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
        <div className="mt-10 text-center">
          <Link to="/events" className="btn-primary">
            View All Events
          </Link>
        </div>
      </section>

      <section className="bg-gray-100 py-16">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900">For Organizers</h2>
          <p className="mx-auto mt-2 max-w-xl text-gray-600">
            Create events, sell tickets, and manage attendees—all in one place.
          </p>
          <Link to="/signup" className="mt-6 inline-block btn-primary">
            Create an Organizer Account
          </Link>
        </div>
      </section>
    </div>
  );
}
