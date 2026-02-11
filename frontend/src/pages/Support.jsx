import { Link } from 'react-router-dom';

export default function Support() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900">Help & Support</h1>
      <p className="mt-2 text-gray-600">
        Find answers and get in touch with our team.
      </p>
      <div className="mt-8 space-y-6">
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900">FAQs</h2>
          <ul className="mt-3 space-y-2 text-gray-600">
            <li><strong>How do I book a ticket?</strong> Log in, go to an event, select a ticket type and quantity, then complete checkout.</li>
            <li><strong>How do I create an event?</strong> Sign up as an organizer, then go to Dashboard → Create event.</li>
            <li><strong>Can I cancel a booking?</strong> Yes, from My Bookings you can cancel. Refunds depend on the organizer&apos;s policy.</li>
          </ul>
        </div>
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900">Contact Us</h2>
          <p className="mt-2 text-gray-600">Email: support@eventhub.example.com</p>
          <p className="mt-1 text-gray-600">We typically respond within 24–48 hours.</p>
        </div>
      </div>
      <Link to="/" className="mt-8 inline-block btn-primary">Back to Home</Link>
    </div>
  );
}
