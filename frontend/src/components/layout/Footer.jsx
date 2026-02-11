import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <Link to="/" className="text-lg font-bold text-primary-600">
              EventHub
            </Link>
            <p className="mt-2 text-sm text-gray-500">
              Discover and manage events. Book tickets in one place.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Explore</h3>
            <ul className="mt-2 space-y-1 text-sm text-gray-600">
              <li><Link to="/events" className="hover:text-primary-600">All Events</Link></li>
              <li><Link to="/about" className="hover:text-primary-600">About</Link></li>
              <li><Link to="/support" className="hover:text-primary-600">Support</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Legal</h3>
            <ul className="mt-2 space-y-1 text-sm text-gray-600">
              <li><Link to="/privacy" className="hover:text-primary-600">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-primary-600">Terms of Service</Link></li>
              <li><Link to="/refunds" className="hover:text-primary-600">Refund Policy</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Contact</h3>
            <p className="mt-2 text-sm text-gray-600">support@eventhub.example.com</p>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-6 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} EventHub. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
