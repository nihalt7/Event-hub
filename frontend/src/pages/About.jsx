import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900">About EventHub</h1>
      <p className="mt-4 text-gray-600">
        EventHub is a production-ready event management platform where attendees can discover events,
        book tickets, and manage their bookings. Organizers can create and manage events, track attendees,
        and grow their audience.
      </p>
      <h2 className="mt-8 text-xl font-semibold text-gray-900">For Attendees</h2>
      <ul className="mt-2 list-inside list-disc space-y-1 text-gray-600">
        <li>Browse events by category and search</li>
        <li>Book tickets securely</li>
        <li>View and manage your bookings</li>
        <li>Leave reviews and ratings</li>
      </ul>
      <h2 className="mt-8 text-xl font-semibold text-gray-900">For Organizers</h2>
      <ul className="mt-2 list-inside list-disc space-y-1 text-gray-600">
        <li>Create and publish events</li>
        <li>Set ticket types and pricing</li>
        <li>View attendees and revenue</li>
        <li>Manage event status (draft, published, completed)</li>
      </ul>
      <p className="mt-8 text-gray-600">
        Built with React, Node.js, Express, and MongoDB. Secure authentication with JWT and bcrypt.
      </p>
      <Link to="/events" className="mt-8 inline-block btn-primary">Browse Events</Link>
    </div>
  );
}
