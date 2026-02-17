import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { API_URL } from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({ average: 0, count: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    api
      .get(`/events/${id}`)
      .then((res) => setEvent(res.data.event))
      .catch(() => setEvent(null))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    api.get(`/reviews/event/${id}`).then((res) => {
      setReviews(res.data.data || []);
      setReviewStats(res.data.stats || { average: 0, count: 0 });
    }).catch(() => {});
  }, [id]);

  const formatDate = (d) => (d ? new Date(d).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' }) : '');
  const handleBook = () => {
    if (!user) {
      toast.error('Please log in to book');
      navigate('/login');
      return;
    }
    if (!selectedTicket) {
      toast.error('Select a ticket type');
      return;
    }
    navigate(`/events/${id}/checkout`, { state: { ticketType: selectedTicket, quantity } });
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please log in to leave a review');
      return;
    }
    setSubmittingReview(true);
    try {
      await api.post(`/reviews/event/${id}`, { rating: reviewRating, comment: reviewComment });
      toast.success('Review submitted');
      setReviewComment('');
      const res = await api.get(`/reviews/event/${id}`);
      setReviews(res.data.data || []);
      setReviewStats(res.data.stats || { average: 0, count: 0 });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
      </div>
    );
  }
  if (!event) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 text-center">
        <p className="text-gray-500">Event not found.</p>
        <Link to="/events" className="mt-4 inline-block btn-primary">Back to Events</Link>
      </div>
    );
  }

  const available = (t) => (t.quantity || 0) - (t.sold || 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="card overflow-hidden">
            <div className="aspect-video bg-gray-200">
              {event.images?.[0] ? (
                <img src={event.images[0].startsWith('http') ? event.images[0] : `${API_URL}${event.images[0]}`} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-6xl text-gray-400">🎫</div>
              )}
            </div>
            <div className="p-6">
              <span className="text-sm font-medium uppercase text-primary-600">{event.category}</span>
              <h1 className="mt-2 text-2xl font-bold text-gray-900">{event.title}</h1>
              <p className="mt-2 text-gray-600">{event.description}</p>
              <dl className="mt-6 grid gap-2 sm:grid-cols-2">
                <div>
                  <dt className="text-sm text-gray-500">Date & time</dt>
                  <dd className="font-medium">{formatDate(event.date)}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Venue</dt>
                  <dd className="font-medium">{event.venue}</dd>
                </div>
                {event.organizer && (
                  <div>
                    <dt className="text-sm text-gray-500">Organizer</dt>
                    <dd className="font-medium">{event.organizer.name}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          <div className="mt-8 card p-6">
            <h2 className="text-lg font-semibold text-gray-900">Reviews</h2>
            <p className="text-sm text-gray-500">
              {reviewStats.count} review(s) • Average {reviewStats.average?.toFixed(1) || '0'} ★
            </p>
            {user && (
              <form onSubmit={handleSubmitReview} className="mt-4 space-y-2">
                <div className="flex items-center gap-2">
                  <label className="text-sm">Rating:</label>
                  {[1, 2, 3, 4, 5].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setReviewRating(r)}
                      className={`text-lg ${reviewRating >= r ? 'text-amber-400' : 'text-gray-300'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Your review (optional)"
                  className="input-field min-h-[80px]"
                  maxLength={500}
                />
                <button type="submit" disabled={submittingReview} className="btn-primary">
                  {submittingReview ? 'Submitting...' : 'Submit review'}
                </button>
              </form>
            )}
            <ul className="mt-6 space-y-4">
              {reviews.slice(0, 10).map((r) => (
                <li key={r._id} className="border-b border-gray-100 pb-4 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{r.user?.name || 'User'}</span>
                    <span className="text-amber-500">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                  </div>
                  {r.comment && <p className="mt-1 text-sm text-gray-600">{r.comment}</p>}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div>
          <div className="card sticky top-24 p-6">
            <h2 className="text-lg font-semibold text-gray-900">Tickets</h2>
            {event.status !== 'published' && (
              <p className="mt-2 text-sm text-amber-600">This event is not open for booking yet.</p>
            )}
            {event.ticketTypes?.length ? (
              <>
                <div className="mt-4 space-y-2">
                  {event.ticketTypes.map((t) => (
                    <label
                      key={t.name}
                      className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 ${
                        selectedTicket?.name === t.name ? 'border-primary-600 bg-primary-50' : 'border-gray-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="ticket"
                        checked={selectedTicket?.name === t.name}
                        onChange={() => setSelectedTicket(t)}
                        disabled={available(t) <= 0}
                      />
                      <span className="font-medium">{t.name}</span>
                      <span>₹{t.price} × {available(t)} left</span>
                    </label>
                  ))}
                </div>
                {selectedTicket && available(selectedTicket) > 0 && (
                  <>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700">Quantity</label>
                      <input
                        type="number"
                        min={1}
                        max={available(selectedTicket)}
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        className="input-field mt-1 w-24"
                      />
                    </div>
                    <p className="mt-2 font-medium">
                      Total: ₹{selectedTicket.price * quantity}
                    </p>
                    <button
                      onClick={handleBook}
                      disabled={event.status !== 'published'}
                      className="btn-primary mt-4 w-full"
                    >
                      Book now
                    </button>
                  </>
                )}
              </>
            ) : (
              <p className="mt-2 text-sm text-gray-500">No ticket types added.</p>
            )}
            {user && (String(user.id) === String(event.organizer?._id || event.organizer)) && (
              <Link to={`/events/edit/${event._id}`} className="mt-4 block text-center text-sm text-primary-600 hover:underline">
                Edit event
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
