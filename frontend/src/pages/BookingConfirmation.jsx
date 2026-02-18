import { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';
import api from '../api/axios';

export default function BookingConfirmation() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const ticketRef = useRef(null);

  useEffect(() => {
    api
      .get(`/bookings/${id}`)
      .then((res) => setBooking(res.data.booking))
      .catch(() => setBooking(null))
      .finally(() => setLoading(false));
  }, [id]);

  const formatDateOnly = (d) => (d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase() : '');
  const formatTime = (d) => (d ? new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : '');
  const formatDateFull = (d) => (d ? new Date(d).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' }) : '');

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
      </div>
    );
  }
  if (!booking) {
    return (
      <div className="mx-auto max-w-md px-4 py-12 text-center">
        <p className="text-gray-500">Booking not found.</p>
        <Link to="/bookings" className="mt-4 inline-block btn-primary">My Bookings</Link>
      </div>
    );
  }

  const eventTitle = booking.event?.title || 'Event';
  const venue = booking.event?.venue || '—';
  const ticketTypeName = booking.ticketType?.name || 'Ticket';
  const userName = booking.user?.name ? booking.user.name.toUpperCase() : '—';
  const userEmail = (booking.user?.email || '').toUpperCase();
  const qrData = encodeURIComponent(`${typeof window !== 'undefined' ? window.location.origin : ''}/bookings/${booking._id}/confirmation`);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadImage = async () => {
    if (!ticketRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(ticketRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#f3f4f6',
        logging: false,
      });
      const link = document.createElement('a');
      link.download = `eventhub-ticket-${booking.event?.title?.replace(/\s+/g, '-') || booking._id}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success('Ticket downloaded');
    } catch (err) {
      toast.error('Download failed. Try Print / Save as PDF instead.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-[60vh] bg-gray-100 py-12 px-4">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .ticket-print-area,
          .ticket-print-area * { visibility: visible; }
          .ticket-print-area {
            position: absolute !important;
            left: 50% !important;
            top: 24px !important;
            transform: translateX(-50%) !important;
            max-width: 100%;
          }
          .no-print { display: none !important; }
        }
      `}</style>
      <div className="mx-auto max-w-sm">
        {/* Ticket card with stub cutouts */}
        <div ref={ticketRef} className="ticket-print-area relative">
          {/* Left stub */}
          <div className="absolute left-0 top-1/2 z-10 h-6 w-3 -translate-y-1/2 rounded-r-full bg-gray-100" aria-hidden />
          {/* Right stub */}
          <div className="absolute right-0 top-1/2 z-10 h-6 w-3 -translate-y-1/2 rounded-l-full bg-gray-100" aria-hidden />

          <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-blue-800 text-white shadow-xl">
            {/* Top: EVENT label + title + venue badge */}
            <div className="flex items-start justify-between gap-3 p-5 pb-3">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-widest text-white/80">Event</p>
                <h2 className="mt-0.5 text-xl font-bold uppercase tracking-tight line-clamp-2">{eventTitle}</h2>
              </div>
              <div className="shrink-0 rounded border border-white/60 bg-white/10 px-2 py-1 text-xs font-semibold uppercase">
                {venue.length > 12 ? venue.slice(0, 10) + '…' : venue}
              </div>
            </div>
            <div className="flex justify-end pr-5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white/70 bg-white/10 text-white">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
              </div>
            </div>

<<<<<<< HEAD
            {/* Booking ID */}
            <div className="border-t border-white/20 px-5 py-2">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-medium uppercase tracking-widest text-white/80">Booking ID</p>
                <p className="font-mono text-sm font-bold tracking-wider">{booking._id?.slice(-10).toUpperCase()}</p>
              </div>
            </div>

=======
>>>>>>> c2611885a86f5d785e90f90ba272a6e7b4546637
            {/* Middle: DATE | TICKET */}
            <div className="flex items-stretch border-t border-white/20 px-5 py-4">
              <div className="flex-1">
                <p className="text-[10px] font-medium uppercase tracking-widest text-white/80">Date</p>
                <p className="mt-0.5 text-lg font-bold">{formatDateOnly(booking.event?.date)}</p>
                <p className="text-sm text-white/90">{formatTime(booking.event?.date)}</p>
              </div>
              <div className="w-px shrink-0 bg-white/30" aria-hidden />
              <div className="flex flex-1 items-center justify-center">
                <div className="text-center">
                  <p className="text-[10px] font-medium uppercase tracking-widest text-white/80">Ticket</p>
                  <p className="mt-0.5 text-lg font-bold">{ticketTypeName}</p>
                  <p className="text-xs text-white/80">{booking.quantity} {booking.quantity === 1 ? 'ticket' : 'tickets'}</p>
                </div>
              </div>
            </div>

            {/* Perforation line */}
            <div className="flex items-center px-5">
              <span className="flex-1 border-t border-dashed border-white/40" aria-hidden />
              <span className="mx-2 h-2 w-2 rounded-full border border-white/50 bg-blue-700" aria-hidden />
              <span className="flex-1 border-t border-dashed border-white/40" aria-hidden />
            </div>

            {/* Bottom: QR + NAME / EMAIL */}
            <div className="flex gap-4 p-5 pt-4">
              <div className="shrink-0 rounded-lg border-2 border-white/40 bg-white p-1.5">
<<<<<<< HEAD
                {booking.qrCode ? (
                  <img
                    src={booking.qrCode}
                    alt="Booking QR code"
                    width={120}
                    height={120}
                    className="block h-[120px] w-[120px]"
                  />
                ) : (
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${qrData}&format=svg`}
                    alt="Booking QR code"
                    width={120}
                    height={120}
                    className="block h-[120px] w-[120px]"
                    crossOrigin="anonymous"
                  />
                )}
=======
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${qrData}&format=svg`}
                  alt="Booking QR code"
                  width={120}
                  height={120}
                  className="block h-[120px] w-[120px]"
                  crossOrigin="anonymous"
                />
>>>>>>> c2611885a86f5d785e90f90ba272a6e7b4546637
              </div>
              <div className="flex min-w-0 flex-1 flex-col justify-center">
                <p className="text-[10px] font-medium uppercase tracking-widest text-white/80">Name</p>
                <p className="mt-0.5 truncate text-base font-bold">{userName}</p>
                <p className="mt-3 text-[10px] font-medium uppercase tracking-widest text-white/80">Email</p>
                <p className="mt-0.5 truncate text-sm font-medium text-white/90">{userEmail || '—'}</p>
              </div>
            </div>
<<<<<<< HEAD

            {/* Full Booking ID for manual verification */}
            <div className="border-t border-white/20 bg-white/10 px-5 py-3 text-center">
              <p className="text-[9px] font-medium uppercase tracking-widest text-white/70 mb-1">Booking Reference (for manual check-in)</p>
              <p className="font-mono text-sm font-bold tracking-wider text-white select-all">{booking._id}</p>
            </div>
=======
>>>>>>> c2611885a86f5d785e90f90ba272a6e7b4546637
          </div>
        </div>

        <p className="no-print mt-6 text-center text-sm text-gray-500">Booking confirmed • {formatDateFull(booking.event?.date)}</p>

        <div className="no-print mt-4 flex flex-col gap-2 sm:flex-row sm:gap-3">
          <button
            type="button"
            onClick={handleDownloadImage}
            disabled={downloading}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border-2 border-primary-600 bg-white px-4 py-2.5 font-medium text-primary-600 transition hover:bg-primary-50 disabled:opacity-60"
          >
            {downloading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            )}
            {downloading ? 'Downloading...' : 'Download ticket'}
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border-2 border-gray-300 bg-white px-4 py-2.5 font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            Print / Save as PDF
          </button>
        </div>

        <div className="no-print mt-4 flex gap-3">
          <Link to="/bookings" className="btn-secondary flex-1 text-center">My Bookings</Link>
          <Link to={`/events/${booking.event?._id}`} className="btn-primary flex-1 text-center">View Event</Link>
        </div>
      </div>
    </div>
  );
}
