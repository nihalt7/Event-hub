import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function AdminPanel() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('events');

  useEffect(() => {
    if (user?.role !== 'admin') return;
    Promise.all([
      api.get('/users').then((r) => setUsers(r.data.data || [])).catch(() => setUsers([])),
      api.get('/events/admin/all').then((r) => setEvents(r.data.data || [])).catch(() => setEvents([])),
    ]).finally(() => setLoading(false));
  }, [user?.role]);

  const handleApprove = async (eventId) => {
    try {
      await api.patch(`/events/${eventId}/approve`);
      toast.success('Event approved');
      setEvents((prev) => prev.map((e) => (e._id === eventId ? { ...e, approvedByAdmin: true, status: 'published' } : e)));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="mx-auto max-w-md px-4 py-12 text-center">
        <p className="text-gray-500">Access denied. Admin only.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
      <p className="mt-1 text-gray-600">Manage users and events</p>

      <div className="mt-6 flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('events')}
          className={`border-b-2 px-4 py-2 font-medium ${
            activeTab === 'events' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-600'
          }`}
        >
          Events
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`border-b-2 px-4 py-2 font-medium ${
            activeTab === 'users' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-600'
          }`}
        >
          Users
        </button>
      </div>

      {activeTab === 'events' && (
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Event</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Organizer</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Approved</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {events.map((event) => (
                <tr key={event._id}>
                  <td className="px-4 py-3 font-medium text-gray-900">{event.title}</td>
                  <td className="px-4 py-3 text-gray-600">{event.organizer?.name}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      event.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {event.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">{event.approvedByAdmin ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-3 text-right">
                    <Link to={`/events/${event._id}`} className="text-primary-600 hover:underline">View</Link>
                    {!event.approvedByAdmin && (
                      <>
                        {' · '}
                        <button
                          onClick={() => handleApprove(event._id)}
                          className="text-primary-600 hover:underline"
                        >
                          Approve
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((u) => (
                <tr key={u._id}>
                  <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                  <td className="px-4 py-3 text-gray-600">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700">
                      {u.role}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
