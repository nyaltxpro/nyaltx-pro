'use client';

import { useEffect, useMemo, useState } from 'react';
import { FaPlus, FaRegSave, FaTrash, FaYoutube } from 'react-icons/fa';
import { HiRefresh } from 'react-icons/hi';
import toast from 'react-hot-toast';

interface TradeVideo {
  _id: string;
  title: string;
  youtubeUrl: string;
  videoId: string;
  description?: string;
  order: number;
  isActive: boolean;
  thumbnailUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

const defaultFormState = {
  title: '',
  youtubeUrl: '',
  description: '',
  order: 0,
  isActive: true,
};

export default function AdminTradeVideos() {
  const [videos, setVideos] = useState<TradeVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formState, setFormState] = useState(defaultFormState);
  const [error, setError] = useState<string | null>(null);

  const sortedVideos = useMemo(
    () => [...videos].sort((a, b) => a.order - b.order || (a.createdAt ?? '').localeCompare(b.createdAt ?? '')),
    [videos]
  );

  useEffect(() => {
    fetchVideos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchVideos = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/trade-videos');
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load trade videos');
      }
      setVideos(Array.isArray(data.videos) ? data.videos : []);
    } catch (err: any) {
      console.error('Failed to fetch trade videos:', err);
      setError(err.message || 'Failed to load trade videos');
      toast.error(err.message || 'Failed to load trade videos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name } = e.target;

    if (e.target instanceof HTMLInputElement && e.target.type === 'checkbox') {
      const { checked } = e.target;
      setFormState(prev => ({
        ...prev,
        [name]: checked,
      }));
      return;
    }

    const value = e.target.value;
    setFormState(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    const loadingToast = toast.loading('Adding new video...');
    try {
      const payload = {
        ...formState,
        order: Number(formState.order) || 0,
      };
      const response = await fetch('/api/admin/trade-videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create video');
      }
      toast.success('Video added successfully');
      setFormState(defaultFormState);
      await fetchVideos();
    } catch (err: any) {
      console.error('Failed to add video:', err);
      setError(err.message || 'Failed to add video');
      toast.error(err.message || 'Failed to add video');
    } finally {
      setIsSubmitting(false);
      toast.dismiss(loadingToast);
    }
  };

  const handleUpdate = async (id: string, updates: Partial<TradeVideo>) => {
    const updatingToast = toast.loading('Updating video...');
    try {
      const response = await fetch('/api/admin/trade-videos', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...updates }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update video');
      }
      toast.success('Video updated');
      await fetchVideos();
    } catch (err: any) {
      console.error('Failed to update video:', err);
      toast.error(err.message || 'Failed to update video');
    } finally {
      toast.dismiss(updatingToast);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this video? This action cannot be undone.');
    if (!confirmed) return;

    const deletingToast = toast.loading('Deleting video...');
    try {
      const response = await fetch('/api/admin/trade-videos', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete video');
      }
      toast.success('Video deleted');
      setVideos(prev => prev.filter(video => video._id !== id));
    } catch (err: any) {
      console.error('Failed to delete video:', err);
      toast.error(err.message || 'Failed to delete video');
    } finally {
      toast.dismiss(deletingToast);
    }
  };

  return (
    <div className="space-y-6" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white flex items-center gap-2">
          <FaYoutube className="text-red-500" /> Manage Trade Page Videos
        </h1>
        <button
          onClick={fetchVideos}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-[#00b8d8] hover:bg-[#00a6c4] text-white rounded-lg transition disabled:opacity-60"
        >
          <HiRefresh className={`text-lg ${isLoading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <form onSubmit={handleSubmit} className="bg-[#111b24] border border-gray-800/60 rounded-xl p-5 space-y-4">
          <h2 className="text-lg font-medium text-white flex items-center gap-2">
            <FaPlus /> Add New Video
          </h2>

          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm text-gray-300">Title</label>
            <input
              type="text"
              name="title"
              required
              value={formState.title}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-gray-800 bg-[#0c141c] px-4 py-2 text-white focus:border-[#00b8d8] focus:outline-none"
              placeholder="Example: How to use NYALTX Trade"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-300">YouTube URL</label>
            <input
              type="url"
              name="youtubeUrl"
              required
              value={formState.youtubeUrl}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-gray-800 bg-[#0c141c] px-4 py-2 text-white focus:border-[#00b8d8] focus:outline-none"
              placeholder="https://www.youtube.com/watch?v=..."
            />
            <p className="text-xs text-gray-500">Supports standard YouTube share links and youtu.be links.</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-300">Video Description (optional)</label>
            <textarea
              name="description"
              rows={3}
              value={formState.description}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-gray-800 bg-[#0c141c] px-4 py-2 text-white focus:border-[#00b8d8] focus:outline-none"
              placeholder="Briefly describe the video content..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-300">Display Order</label>
              <input
                type="number"
                name="order"
                value={formState.order}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-gray-800 bg-[#0c141c] px-4 py-2 text-white focus:border-[#00b8d8] focus:outline-none"
              />
            </div>
            <label className="flex items-center gap-3 text-sm text-gray-300">
              <input
                type="checkbox"
                name="isActive"
                checked={formState.isActive}
                onChange={handleInputChange}
                className="h-4 w-4 rounded border-gray-700 bg-[#0c141c]"
              />
              Visible on Trade Page
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 rounded-lg bg-[#00b8d8] px-4 py-2 font-medium text-white transition hover:bg-[#00a6c4] disabled:opacity-60"
          >
            {isSubmitting ? 'Saving...' : 'Add Video'}
          </button>
        </form>

        <div className="bg-[#111b24] border border-gray-800/60 rounded-xl p-5">
          <h2 className="text-lg font-medium text-white mb-4">Video Preview</h2>
          {formState.youtubeUrl ? (
            <iframe
              className="aspect-video w-full rounded-lg border border-gray-800"
              src={`https://www.youtube.com/embed/${extractVideoId(formState.youtubeUrl) ?? ''}`}
              title={formState.title || 'Video preview'}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <div className="flex h-full min-h-[240px] items-center justify-center rounded-lg border border-dashed border-gray-700 text-gray-500">
              Enter a YouTube URL to preview the video
            </div>
          )}
        </div>
      </div>

      <div className="bg-[#111b24] border border-gray-800/60 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-white">Current Videos</h2>
          <span className="text-sm text-gray-400">Showing {videos.length} video{videos.length === 1 ? '' : 's'}</span>
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-gray-400">Loading videos...</div>
        ) : sortedVideos.length === 0 ? (
          <div className="py-16 text-center text-gray-400">No videos added yet.</div>
        ) : (
          <div className="space-y-4">
            {sortedVideos.map(video => (
              <div key={video._id} className="grid grid-cols-1 gap-4 rounded-lg border border-gray-800/80 bg-[#0c141c] p-4 md:grid-cols-[220px_1fr]">
                <div className="relative overflow-hidden rounded-lg border border-gray-800/80">
                  {video.thumbnailUrl ? (
                    <img src={video.thumbnailUrl} alt={video.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full min-h-[140px] items-center justify-center text-gray-500">
                      No thumbnail
                    </div>
                  )}
                  {!video.isActive && (
                    <span className="absolute left-2 top-2 rounded bg-red-500/80 px-2 py-1 text-xs font-medium text-white">
                      Hidden
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{video.title}</h3>
                    {video.description && <p className="text-sm text-gray-400 mt-1">{video.description}</p>}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
                    <span className="rounded bg-[#16222d] px-3 py-1">Order: {video.order}</span>
                    <span className="rounded bg-[#16222d] px-3 py-1">Video ID: {video.videoId}</span>
                    <a
                      href={video.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#00b8d8] hover:text-[#00a6c4]"
                    >
                      View on YouTube
                    </a>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <label className="flex items-center gap-2 text-sm text-gray-300">
                      <input
                        type="checkbox"
                        checked={video.isActive}
                        onChange={e => handleUpdate(video._id, { isActive: e.target.checked })}
                        className="h-4 w-4 rounded border-gray-700 bg-[#0c141c]"
                      />
                      Visible on Trade Page
                    </label>

                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        defaultValue={video.order}
                        className="w-24 rounded-lg border border-gray-800 bg-[#0c141c] px-3 py-2 text-sm text-white focus:border-[#00b8d8] focus:outline-none"
                        onBlur={e => {
                          const newOrder = Number(e.target.value);
                          if (Number.isFinite(newOrder) && newOrder !== video.order) {
                            handleUpdate(video._id, { order: newOrder });
                          }
                        }}
                      />
                      <span className="text-sm text-gray-400">Change order</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => {
                        const newTitle = window.prompt('Update video title', video.title);
                        if (newTitle && newTitle !== video.title) {
                          handleUpdate(video._id, { title: newTitle });
                        }
                      }}
                      className="flex items-center gap-2 rounded-lg border border-[#00b8d8]/40 px-3 py-2 text-sm text-[#00b8d8] transition hover:bg-[#00b8d8]/10"
                    >
                      <FaRegSave /> Quick Edit Title
                    </button>

                    <button
                      onClick={() => handleDelete(video._id)}
                      className="flex items-center gap-2 rounded-lg border border-red-500/40 px-3 py-2 text-sm text-red-400 transition hover:bg-red-500/10"
                    >
                      <FaTrash /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const extractVideoId = (url: string): string | null => {
  if (!url) return null;
  const regex = /(?:youtube\.com\/(?:shorts\/|[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};
