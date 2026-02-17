export default function Refunds() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900">Refund Policy</h1>
      <p className="mt-2 text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
      <div className="mt-6 space-y-4 text-gray-600">
        <p>
          EventHub facilitates ticket bookings between attendees and organizers. Refund eligibility
          depends on the event organizer&apos;s policy and the timing of the request.
        </p>
        <h2 className="mt-6 text-lg font-semibold text-gray-900">Requesting a Refund</h2>
        <p>
          To request a refund, cancel your booking from &quot;My Bookings&quot; or contact support.
          If the organizer allows refunds, we will process the refund to your original payment method
          within 5–10 business days.
        </p>
        <h2 className="mt-6 text-lg font-semibold text-gray-900">Cancelled Events</h2>
        <p>
          If an event is cancelled by the organizer, you will receive a full refund automatically
          (or as per the organizer&apos;s stated policy).
        </p>
        <h2 className="mt-6 text-lg font-semibold text-gray-900">Contact</h2>
        <p>For refund inquiries: support@eventhub.example.com.</p>
      </div>
    </div>
  );
}
