import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <h1 className="text-6xl font-bold text-gray-300">404</h1>
      <h2 className="mt-4 text-xl font-semibold text-gray-900">Page not found</h2>
      <p className="mt-2 text-gray-600">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link to="/" className="mt-8 inline-block btn-primary">Go to Home</Link>
    </div>
  );
}
