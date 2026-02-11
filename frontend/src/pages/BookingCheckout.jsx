import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';

export default function BookingCheckout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { ticketType, quantity } = location.state || {};
  const [loading, setLoading] = useState(false);

  const handlePayWithRazorpay = async () => {
    if (!ticketType || !quantity) {
      toast.error('Invalid booking details');
      navigate(`/events/${id}`);
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/payments/create-order', {
        eventId: id,
        ticketTypeName: ticketType.name,
        quantity,
      });

      if (!data.success || !data.orderId) {
        toast.error(data.message || 'Failed to create order');
        setLoading(false);
        return;
      }

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency || 'INR',
        name: 'EventHub',
        description: `${ticketType.name} × ${quantity} ticket(s)`,
        order_id: data.orderId,
        handler: async (response) => {
          try {
            const verifyRes = await api.post('/payments/verify', {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              eventId: id,
              ticketTypeName: ticketType.name,
              quantity,
            });
            toast.success('Payment successful! Booking confirmed.');
            navigate(`/bookings/${verifyRes.data.booking._id}/confirmation`, { replace: true });
          } catch (err) {
            toast.error(err.response?.data?.message || 'Payment verification failed');
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: '',
        },
        theme: {
          color: '#6366f1',
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', () => {
        toast.error('Payment failed. Please try again.');
        setLoading(false);
      });
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initiate payment');
      setLoading(false);
    }
  };

  if (!ticketType) {
    return (
      <div className="mx-auto max-w-md px-4 py-12 text-center">
        <p className="text-gray-500">Missing booking details.</p>
        <button onClick={() => navigate(`/events/${id}`)} className="mt-4 btn-primary">
          Back to event
        </button>
      </div>
    );
  }

  const total = ticketType.price * quantity;

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <div className="card p-6">
        <h1 className="text-xl font-bold text-gray-900">Checkout</h1>
        <div className="mt-4 space-y-2 border-t border-gray-200 pt-4">
          <p><span className="text-gray-500">Ticket:</span> {ticketType.name}</p>
          <p><span className="text-gray-500">Price:</span> ₹{ticketType.price}</p>
          <p><span className="text-gray-500">Quantity:</span> {quantity}</p>
          <p className="font-semibold"><span className="text-gray-500">Total:</span> ₹{total}</p>
        </div>
        <p className="mt-4 text-sm text-gray-500">
          Secure payment powered by Razorpay. You will be redirected to complete the payment.
        </p>
        <div className="mt-6 flex gap-3">
          <button onClick={() => navigate(-1)} className="btn-secondary flex-1" disabled={loading}>
            Back
          </button>
          <button onClick={handlePayWithRazorpay} disabled={loading} className="btn-primary flex-1">
            {loading ? 'Opening payment...' : 'Pay ₹' + total + ' with Razorpay'}
          </button>
        </div>
      </div>
    </div>
  );
}
