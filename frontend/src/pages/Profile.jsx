import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [profile, setProfile] = useState({
    bio: user?.profile?.bio || '',
    phone: user?.profile?.phone || '',
    address: user?.profile?.address || {},
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.put(`/users/${user.id}`, {
        name,
        profile: {
          bio: profile.bio,
          phone: profile.phone,
          address: profile.address,
        },
      });
      updateUser(data.user);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
      <p className="mt-1 text-gray-600">Update your bio and contact details</p>
      <form onSubmit={handleSubmit} className="mt-6 card p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-field mt-1"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={user?.email || ''}
            disabled
            className="input-field mt-1 bg-gray-50"
          />
          <p className="mt-1 text-xs text-gray-500">Email cannot be changed.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Bio</label>
          <textarea
            value={profile.bio}
            onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
            className="input-field mt-1 min-h-[80px]"
            maxLength={500}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Phone</label>
          <input
            type="text"
            value={profile.phone}
            onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
            className="input-field mt-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">City</label>
          <input
            type="text"
            value={profile.address?.city || ''}
            onChange={(e) => setProfile((p) => ({ ...p, address: { ...p.address, city: e.target.value } }))}
            className="input-field mt-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Country</label>
          <input
            type="text"
            value={profile.address?.country || ''}
            onChange={(e) => setProfile((p) => ({ ...p, address: { ...p.address, country: e.target.value } }))}
            className="input-field mt-1"
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Saving...' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}
