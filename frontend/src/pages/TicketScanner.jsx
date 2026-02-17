import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import toast from 'react-hot-toast';
import api from '../api/axios';

export default function TicketScanner() {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, checkedIn: 0 });
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  // Fetch event details
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await api.get(`/events/${eventId}`);
        setEvent(res.data.event);
      } catch (err) {
        toast.error('Failed to load event');
      }
    };
    fetchEvent();
    fetchStats();
  }, [eventId]);

  const fetchStats = async () => {
    try {
      const res = await api.get(`/bookings/event/${eventId}`);
      const bookings = res.data.data || [];
      setStats({
        total: bookings.length,
        checkedIn: bookings.filter(b => b.checkedIn).length,
      });
    } catch (err) {
      console.error('Failed to fetch stats');
    }
  };

  // Initialize QR Scanner
  useEffect(() => {
    if (scanning && scannerRef.current && !html5QrCodeRef.current) {
      html5QrCodeRef.current = new Html5QrcodeScanner(
        'qr-reader',
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        false
      );

      html5QrCodeRef.current.render(
        (decodedText) => {
          handleScan(decodedText);
        },
        (error) => {
          // Ignore scan errors (no QR detected)
        }
      );
    }

    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.clear().catch(console.error);
        html5QrCodeRef.current = null;
      }
    };
  }, [scanning]);

  const handleScan = async (data) => {
    if (loading) return;
    
    try {
      // Parse QR data
      const payload = JSON.parse(data);
      
      // Verify it's for this event
      if (payload.eid !== eventId) {
        setResult({
          success: false,
          message: 'This ticket is for a different event!',
          type: 'wrong_event',
        });
        return;
      }

      setLoading(true);
      
      // Verify ticket on server
      const verifyRes = await api.post('/bookings/verify-qr', { payload });
      
      setResult({
        success: true,
        verified: true,
        booking: verifyRes.data.booking,
        message: 'Ticket verified successfully!',
      });

      // Stop scanning after successful scan
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.pause(true);
      }

    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Invalid QR code';
      setResult({
        success: false,
        message: errorMsg,
        checkedInAt: err.response?.data?.checkedInAt,
        type: err.response?.data?.checkedInAt ? 'already_used' : 'error',
      });
      
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.pause(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!result?.booking) return;
    
    setLoading(true);
    try {
      // Use the direct check-in by ID endpoint
      await api.patch(`/bookings/${result.booking.id}/check-in`);
      
      setResult({
        ...result,
        checkedIn: true,
        message: 'Check-in successful!',
      });
      
      toast.success('Attendee checked in successfully!');
      fetchStats();
      
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-in failed');
      if (err.response?.data?.checkedInAt || err.response?.data?.isUsed) {
        setResult({
          ...result,
          success: false,
          message: 'Ticket already used!',
          type: 'already_used',
          checkedInAt: err.response?.data?.checkedInAt,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const resetScanner = () => {
    setResult(null);
    if (html5QrCodeRef.current) {
      html5QrCodeRef.current.resume();
    }
  };

  const startScanning = () => {
    setScanning(true);
    setResult(null);
  };

  const stopScanning = () => {
    setScanning(false);
    if (html5QrCodeRef.current) {
      html5QrCodeRef.current.clear().catch(console.error);
      html5QrCodeRef.current = null;
    }
  };

  // Manual ticket ID entry
  const [manualId, setManualId] = useState('');
  
  const handleManualVerify = async () => {
    if (!manualId.trim()) return;
    
    const searchTerm = manualId.trim();
    if (searchTerm.length < 3) {
      toast.error('Enter at least 3 characters');
      return;
    }
    
    setLoading(true);
    try {
      // Search for booking by partial ID, name, or email
      const res = await api.get(`/bookings/search/${eventId}?q=${encodeURIComponent(searchTerm)}`);
      
      if (res.data.multiple) {
        // Multiple matches found - show list to select
        setResult({
          success: true,
          multiple: true,
          bookings: res.data.bookings,
          message: `Found ${res.data.count} matching bookings`,
        });
        return;
      }

      const booking = res.data.booking;
      setResult({
        success: true,
        verified: true,
        booking: {
          id: booking.id,
          user: booking.user,
          event: booking.event,
          ticketType: booking.ticketType,
          quantity: booking.quantity,
          status: booking.status,
          checkedIn: booking.checkedIn,
          checkedInAt: booking.checkedInAt,
        },
        message: booking.checkedIn ? 'Ticket already used!' : 'Ticket verified successfully!',
        type: booking.checkedIn ? 'already_used' : null,
      });
      
    } catch (err) {
      setResult({
        success: false,
        message: err.response?.data?.message || 'Ticket not found',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // Select booking from multiple results
  const selectBooking = (booking) => {
    setResult({
      success: true,
      verified: true,
      booking: {
        id: booking.id,
        user: booking.user,
        ticketType: booking.ticketType,
        quantity: booking.quantity,
        status: booking.status,
        checkedIn: booking.checkedIn,
        checkedInAt: booking.checkedInAt,
      },
      message: booking.checkedIn ? 'Ticket already used!' : 'Ticket verified successfully!',
      type: booking.checkedIn ? 'already_used' : null,
    });
  };

  const formatTime = (d) =>
    d ? new Date(d).toLocaleString('en-US', { 
      month: 'short', day: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    }) : '';

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-6">
        <Link to="/dashboard" className="text-primary-600 hover:underline text-sm">
          ← Back to Dashboard
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Ticket Scanner</h1>
        {event && (
          <p className="mt-1 text-gray-600">{event.title}</p>
        )}
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        <div className="rounded-lg bg-white p-4 shadow-sm border border-gray-200 text-center">
          <p className="text-sm font-medium text-gray-500">Checked In</p>
          <p className="mt-1 text-3xl font-bold text-green-600">{stats.checkedIn}</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm border border-gray-200 text-center">
          <p className="text-sm font-medium text-gray-500">Total Bookings</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{stats.total}</p>
        </div>
      </div>

      {/* Scanner Controls */}
      {!scanning ? (
        <div className="space-y-4">
          <button
            onClick={startScanning}
            className="w-full btn-primary py-4 text-lg flex items-center justify-center gap-2"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            Start QR Scanner
          </button>

          {/* Manual Entry */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-gray-50 px-2 text-gray-500">or enter manually</span>
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={manualId}
              onChange={(e) => setManualId(e.target.value)}
              placeholder="Booking ID, name, or email"
              className="flex-1 rounded-lg border border-gray-300 px-4 py-3 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              onKeyDown={(e) => e.key === 'Enter' && handleManualVerify()}
            />
            <button
              onClick={handleManualVerify}
              disabled={loading || manualId.trim().length < 3}
              className="btn-primary px-6 disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
          <p className="text-xs text-gray-500 text-center">
            Search by booking ID (partial or full), attendee name, or email
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* QR Scanner */}
          <div 
            id="qr-reader" 
            ref={scannerRef}
            className="rounded-lg overflow-hidden border-2 border-gray-300"
          />
          
          <button
            onClick={stopScanning}
            className="w-full btn-secondary py-3"
          >
            Stop Scanner
          </button>
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div className={`mt-6 rounded-lg p-6 ${
          result.multiple ? 'bg-blue-50 border-2 border-blue-500' :
          result.success && !result.type ? 'bg-green-50 border-2 border-green-500' :
          result.type === 'already_used' ? 'bg-yellow-50 border-2 border-yellow-500' :
          'bg-red-50 border-2 border-red-500'
        }`}>
          {/* Multiple Results */}
          {result.multiple ? (
            <div>
              <h3 className="text-lg font-bold text-blue-800 mb-3">{result.message}</h3>
              <p className="text-sm text-blue-600 mb-4">Select the correct booking:</p>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {result.bookings.map((booking) => (
                  <button
                    key={booking.id}
                    onClick={() => selectBooking(booking)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition ${
                      booking.checkedIn 
                        ? 'bg-yellow-50 border-yellow-300 hover:border-yellow-400' 
                        : 'bg-white border-gray-200 hover:border-blue-400'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">{booking.user?.name}</p>
                        <p className="text-sm text-gray-500">{booking.user?.email}</p>
                        <p className="text-xs text-gray-400 mt-1">ID: ...{booking.id.slice(-8)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{booking.ticketType?.name}</p>
                        <p className="text-xs text-gray-500">{booking.quantity} ticket(s)</p>
                        {booking.checkedIn && (
                          <span className="inline-block mt-1 text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded">
                            Already checked in
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <button
                onClick={resetScanner}
                className="w-full mt-4 btn-secondary py-2"
              >
                Cancel
              </button>
            </div>
          ) : (
            <>
          {/* Status Icon */}
          <div className="flex items-center gap-3 mb-4">
            {result.success && !result.type && !result.booking?.checkedIn ? (
              <div className="h-12 w-12 rounded-full bg-green-500 flex items-center justify-center">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            ) : result.type === 'already_used' || result.booking?.checkedIn ? (
              <div className="h-12 w-12 rounded-full bg-yellow-500 flex items-center justify-center">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            ) : (
              <div className="h-12 w-12 rounded-full bg-red-500 flex items-center justify-center">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            )}
            <div>
              <h3 className={`text-lg font-bold ${
                result.success && !result.type && !result.booking?.checkedIn ? 'text-green-800' :
                result.type === 'already_used' || result.booking?.checkedIn ? 'text-yellow-800' :
                'text-red-800'
              }`}>
                {result.booking?.checkedIn && result.success ? 'Already Checked In' : 
                 result.checkedIn ? 'Check-in Complete!' : result.message}
              </h3>
              {(result.type === 'already_used' || result.booking?.checkedIn) && (
                <p className="text-sm text-yellow-700">
                  Checked in at: {formatTime(result.checkedInAt || result.booking?.checkedInAt)}
                </p>
              )}
            </div>
          </div>

          {/* Attendee Details */}
          {result.booking && (
            <div className="bg-white rounded-lg p-4 mt-4">
              <h4 className="font-semibold text-gray-900 mb-3">Attendee Details</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Name:</span>
                  <span className="font-medium text-gray-900">{result.booking.user?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Email:</span>
                  <span className="text-gray-900">{result.booking.user?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Ticket Type:</span>
                  <span className="text-gray-900">{result.booking.ticketType?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Quantity:</span>
                  <span className="font-medium text-gray-900">{result.booking.quantity} ticket(s)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status:</span>
                  <span className={`font-medium ${
                    result.booking.status === 'confirmed' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {result.booking.status}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-4 flex gap-3">
            {result.success && !result.booking?.checkedIn && !result.checkedIn && result.booking?.status === 'confirmed' && (
              <button
                onClick={handleCheckIn}
                disabled={loading}
                className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Processing...
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Confirm Check-In
                  </>
                )}
              </button>
            )}
            <button
              onClick={resetScanner}
              className="flex-1 btn-secondary py-3"
            >
              Scan Next
            </button>
          </div>
            </>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="mt-8 rounded-lg bg-gray-100 p-4">
        <h4 className="font-semibold text-gray-900 mb-2">Instructions</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Point camera at attendee's QR code</li>
          <li>• Wait for automatic detection</li>
          <li>• Verify attendee details</li>
          <li>• Click "Confirm Check-In" to mark entry</li>
          <li>• Each ticket can only be used once</li>
        </ul>
      </div>
    </div>
  );
}
