export default function Terms() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
      <p className="mt-2 text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
      <div className="mt-6 space-y-4 text-gray-600">
        <p>
          By using EventHub, you agree to these Terms of Service. Please read them carefully.
        </p>
        <h2 className="mt-6 text-lg font-semibold text-gray-900">Use of the Platform</h2>
        <p>
          You may use EventHub to browse events, create an account, book tickets, and (as an organizer)
          create and manage events. You must provide accurate information and comply with applicable laws.
        </p>
        <h2 className="mt-6 text-lg font-semibold text-gray-900">Bookings and Payments</h2>
        <p>
          When you book a ticket, you enter into a contract with the event organizer. Refunds are
          subject to our Refund Policy and the organizer&apos;s terms.
        </p>
        <h2 className="mt-6 text-lg font-semibold text-gray-900">Organizer Responsibilities</h2>
        <p>
          Organizers are responsible for the accuracy of event information, fulfillment of the event,
          and compliance with local regulations. EventHub acts as a platform and is not liable for
          organizer conduct.
        </p>
        <h2 className="mt-6 text-lg font-semibold text-gray-900">Contact</h2>
        <p>For questions about these terms, contact support@eventhub.example.com.</p>
      </div>
    </div>
  );
}
