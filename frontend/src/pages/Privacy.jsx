export default function Privacy() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
      <p className="mt-2 text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
      <div className="mt-6 space-y-4 text-gray-600">
        <p>
          EventHub (&quot;we&quot;) respects your privacy. This policy describes how we collect, use,
          and protect your information when you use our platform.
        </p>
        <h2 className="mt-6 text-lg font-semibold text-gray-900">Information We Collect</h2>
        <p>
          We collect information you provide when registering (name, email, profile details) and when
          booking tickets (event, ticket type, quantity). We use cookies and similar technologies for
          authentication and session management.
        </p>
        <h2 className="mt-6 text-lg font-semibold text-gray-900">How We Use Your Information</h2>
        <p>
          We use your information to provide the service, process bookings, communicate with you, and
          improve our platform. We do not sell your personal data to third parties.
        </p>
        <h2 className="mt-6 text-lg font-semibold text-gray-900">Security</h2>
        <p>
          We use industry-standard security measures including encryption (HTTPS), secure password
          hashing (bcrypt), and JWT-based authentication to protect your data.
        </p>
        <h2 className="mt-6 text-lg font-semibold text-gray-900">Contact</h2>
        <p>For privacy-related questions, contact us at privacy@eventhub.example.com.</p>
      </div>
    </div>
  );
}
