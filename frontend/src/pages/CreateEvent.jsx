import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { API_URL } from '../api/axios';

const CATEGORIES = ['conference', 'workshop', 'concert', 'meetup', 'sports', 'webinar', 'festival', 'other'];

export default function CreateEvent() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'meetup',
    date: '',
    venue: '',
    isOnline: false,
    onlineLink: '',
    status: 'draft',
    featured: false,
    ticketTypes: [{ name: 'General', price: 0, quantity: 100 }],
    images: [],
  });

  const updateForm = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const updateTicket = (index, key, value) => {
    setForm((f) => ({
      ...f,
      ticketTypes: f.ticketTypes.map((t, i) =>
        i === index ? { ...t, [key]: key === 'price' || key === 'quantity' ? Number(value) : value } : t
      ),
    }));
  };

  const addTicketType = () => {
    setForm((f) => ({ ...f, ticketTypes: [...f.ticketTypes, { name: '', price: 0, quantity: 0 }] }));
  };

  const removeTicketType = (index) => {
    setForm((f) => ({
      ...f,
      ticketTypes: f.ticketTypes.filter((_, i) => i !== index),
    }));
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + selectedImages.length > 10) {
      toast.error('Maximum 10 images allowed');
      return;
    }
    files.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Max 5MB per image.`);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
    setSelectedImages((prev) => [...prev, ...files]);
  };

  const removeImage = (index) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setForm((f) => ({
      ...f,
      images: f.images.filter((_, i) => i !== index),
    }));
  };

  const uploadImages = async () => {
    if (selectedImages.length === 0) return [];
    setUploadingImages(true);
    try {
      const formData = new FormData();
      selectedImages.forEach((file) => {
        formData.append('images', file);
      });
      const { data } = await api.post('/upload/images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data.urls || [];
    } catch (err) {
      toast.error('Failed to upload images');
      return [];
    } finally {
      setUploadingImages(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.date || !form.venue) {
      toast.error('Please fill required fields');
      return;
    }
    setLoading(true);
    try {
      // Upload images first
      const imageUrls = await uploadImages();
      const { data } = await api.post('/events', {
        ...form,
        images: imageUrls.length > 0 ? imageUrls : form.images,
        date: new Date(form.date).toISOString(),
        ticketTypes: form.ticketTypes.filter((t) => t.name && (t.quantity > 0 || t.price >= 0)),
      });
      toast.success('Event created');
      navigate(`/events/${data.event._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">Create event</h1>
      <p className="mt-1 text-gray-600">Add a new event and manage tickets</p>
      <form onSubmit={handleSubmit} className="mt-6 card p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Title *</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => updateForm('title', e.target.value)}
            className="input-field mt-1"
            placeholder="Event title"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Description *</label>
          <textarea
            value={form.description}
            onChange={(e) => updateForm('description', e.target.value)}
            className="input-field mt-1 min-h-[100px]"
            required
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              value={form.category}
              onChange={(e) => updateForm('category', e.target.value)}
              className="input-field mt-1"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Date & time *</label>
            <input
              type="datetime-local"
              value={form.date}
              onChange={(e) => updateForm('date', e.target.value)}
              className="input-field mt-1"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Venue *</label>
          <input
            type="text"
            value={form.venue}
            onChange={(e) => updateForm('venue', e.target.value)}
            className="input-field mt-1"
            placeholder="Venue or &quot;Online&quot;"
            required
          />
        </div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.isOnline}
            onChange={(e) => updateForm('isOnline', e.target.checked)}
          />
          <span className="text-sm text-gray-700">Online event</span>
        </label>
        {form.isOnline && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Online link</label>
            <input
              type="url"
              value={form.onlineLink}
              onChange={(e) => updateForm('onlineLink', e.target.value)}
              className="input-field mt-1"
              placeholder="https://..."
            />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select
            value={form.status}
            onChange={(e) => updateForm('status', e.target.value)}
            className="input-field mt-1"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => updateForm('featured', e.target.checked)}
          />
          <span className="text-sm text-gray-700">Featured on homepage</span>
        </label>

        <div className="border-t border-gray-200 pt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Event Images</label>
          <p className="text-xs text-gray-500 mb-3">Upload up to 10 images (max 5MB each)</p>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageSelect}
            className="input-field"
            disabled={uploadingImages || selectedImages.length >= 10}
          />
          {(imagePreviews.length > 0 || form.images.length > 0) && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
              {imagePreviews.map((preview, index) => (
                <div key={`preview-${index}`} className="relative group">
                  <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-32 object-cover rounded-lg border border-gray-200" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                  >
                    ×
                  </button>
                </div>
              ))}
              {form.images.map((url, index) => (
                <div key={`existing-${index}`} className="relative group">
                  <img src={`${API_URL}${url}`} alt={`Event ${index + 1}`} className="w-full h-32 object-cover rounded-lg border border-gray-200" />
                  <button
                    type="button"
                    onClick={() => removeImage(imagePreviews.length + index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900">Ticket types</h3>
            <button type="button" onClick={addTicketType} className="text-sm text-primary-600 hover:underline">
              Add type
            </button>
          </div>
          <div className="mt-3 space-y-3">
            {form.ticketTypes.map((t, i) => (
              <div key={i} className="flex flex-wrap gap-2 rounded-lg border border-gray-200 p-3">
                <input
                  placeholder="Name"
                  value={t.name}
                  onChange={(e) => updateTicket(i, 'name', e.target.value)}
                  className="input-field flex-1 min-w-[80px]"
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={t.price}
                  onChange={(e) => updateTicket(i, 'price', e.target.value)}
                  className="input-field w-24"
                  min={0}
                />
                <input
                  type="number"
                  placeholder="Qty"
                  value={t.quantity}
                  onChange={(e) => updateTicket(i, 'quantity', e.target.value)}
                  className="input-field w-24"
                  min={0}
                />
                {form.ticketTypes.length > 1 && (
                  <button type="button" onClick={() => removeTicketType(i)} className="text-red-600 hover:underline">
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">
            Cancel
          </button>
          <button type="submit" disabled={loading || uploadingImages} className="btn-primary flex-1">
            {uploadingImages ? 'Uploading images...' : loading ? 'Creating...' : 'Create event'}
          </button>
        </div>
      </form>
    </div>
  );
}
