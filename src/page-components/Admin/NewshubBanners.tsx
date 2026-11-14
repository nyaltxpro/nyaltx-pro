'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import {
  FaCopy,
  FaEye,
  FaTrash,
  FaUpload,
  FaImage,
  FaPlus,
  FaCheck,
  FaEdit,
  FaExternalLinkAlt,
  FaTimes,
  FaToggleOn,
  FaToggleOff,
  FaStar,
} from 'react-icons/fa';
import { toReliableIpfsUrl } from '@/utils/ipfsUpload';

export interface NewshubBanner {
  _id: string;
  title: string;
  description?: string;
  category: string;
  imageUrl?: string;
  gradientIndex?: number;
  linkUrl?: string;
  isSponsored?: boolean;
  isActive?: boolean;
  displayOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

const GRADIENTS = [
  'linear-gradient(135deg,#0e7490,#06b6d4)',
  'linear-gradient(135deg,#4c1d95,#8b5cf6)',
  'linear-gradient(135deg,#9a3412,#f59e0b)',
  'linear-gradient(135deg,#14532d,#22c55e)',
  'linear-gradient(135deg,#1e293b,#475569)',
];

const CATEGORIES = [
  'NYAX',
  'Bitcoin',
  'Ethereum',
  'DeFi',
  'Tokenized Stocks',
  'Community',
  'Press Releases',
  'Sponsored',
];

const AdminNewshubBannersClient = dynamic(() => Promise.resolve(NewshubBannersComponent), {
  ssr: false,
  loading: () => (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
        <FaImage className="w-8 h-8 text-[#00b8d8] animate-pulse" />
      </div>
      <p className="text-gray-400 font-medium">Loading Newshub banners...</p>
    </div>
  ),
});

function NewshubBannersComponent() {
  const [banners, setBanners] = useState<NewshubBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'NYAX',
    imageUrl: '',
    gradientIndex: 0,
    linkUrl: '',
    isSponsored: false,
    isActive: true,
    displayOrder: 0,
  });

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/admin/newshub-banners');
      if (!res.ok) throw new Error('Failed to fetch Newshub banners');
      const data = await res.json();
      setBanners(data.banners || []);
    } catch (err: any) {
      setError(err.message || 'An error occurred while loading banners');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingBannerId(null);
    setForm({
      title: '',
      description: '',
      category: 'NYAX',
      imageUrl: '',
      gradientIndex: 0,
      linkUrl: '',
      isSponsored: false,
      isActive: true,
      displayOrder: banners.length ? banners.length + 1 : 1,
    });
    setIsModalOpen(true);
    setError(null);
  };

  const handleOpenEditModal = (banner: NewshubBanner) => {
    setEditingBannerId(banner._id);
    setForm({
      title: banner.title || '',
      description: banner.description || '',
      category: banner.category || 'NYAX',
      imageUrl: banner.imageUrl || '',
      gradientIndex: banner.gradientIndex ?? 0,
      linkUrl: banner.linkUrl || '',
      isSponsored: Boolean(banner.isSponsored),
      isActive: banner.isActive !== false,
      displayOrder: banner.displayOrder ?? 0,
    });
    setIsModalOpen(true);
    setError(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBannerId(null);
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (JPG, PNG, WebP)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be less than 10MB');
      return;
    }

    try {
      setUploadingImage(true);
      setError(null);

      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload/ipfs', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to upload image');
      }

      const uploadedUrl = data.url || `https://gateway.pinata.cloud/ipfs/${data.hash}`;
      setForm(prev => ({ ...prev, imageUrl: uploadedUrl }));
      setSuccess('Banner image uploaded successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Image upload failed:', err);
      setError(err.message || 'Image upload failed. You can also paste an image URL directly.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Banner headline is required');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const method = editingBannerId ? 'PUT' : 'POST';
      const bodyData = editingBannerId
        ? { ...form, id: editingBannerId }
        : form;

      const res = await fetch('/api/admin/newshub-banners', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });

      const result = await res.json();
      if (!res.ok || result.error) {
        throw new Error(result.error || 'Failed to save banner');
      }

      setSuccess(editingBannerId ? 'Banner updated successfully!' : 'Banner created successfully!');
      setTimeout(() => setSuccess(null), 3000);
      handleCloseModal();
      loadBanners();
    } catch (err: any) {
      setError(err.message || 'Failed to save banner');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (banner: NewshubBanner) => {
    try {
      setError(null);
      const nextActive = !banner.isActive;
      const res = await fetch('/api/admin/newshub-banners', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: banner._id,
          isActive: nextActive,
        }),
      });

      if (!res.ok) throw new Error('Failed to update banner status');
      setBanners(prev =>
        prev.map(b => (b._id === banner._id ? { ...b, isActive: nextActive } : b))
      );
      setSuccess(`Banner ${nextActive ? 'activated' : 'deactivated'} successfully`);
      setTimeout(() => setSuccess(null), 2500);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteBanner = async (banner: NewshubBanner) => {
    if (!confirm(`Are you sure you want to delete banner "${banner.title}"?`)) {
      return;
    }

    try {
      setError(null);
      const res = await fetch(`/api/admin/newshub-banners?id=${banner._id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete banner');
      setBanners(prev => prev.filter(b => b._id !== banner._id));
      setSuccess('Banner deleted successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-[#00b8d8]/20 text-[#00b8d8] border border-[#00b8d8]/30">
              News Hub Page
            </span>
            <h2
              className="text-2xl font-bold text-white tracking-tight"
              style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
            >
              Newshub Banners
            </h2>
          </div>
          <p className="text-gray-400 text-sm mt-1">
            Upload and manage the featured carousel banners displayed on the{' '}
            <code className="text-[#00b8d8] bg-black/40 px-1.5 py-0.5 rounded">/newshub</code> page.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/newshub"
            target="_blank"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-gray-700 bg-gray-800/80 hover:bg-gray-700/80 text-gray-200 text-sm font-medium transition-colors shadow-sm"
          >
            <FaExternalLinkAlt className="w-3.5 h-3.5 text-[#00b8d8]" />
            Preview /newshub
          </Link>

          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-linear-to-r from-[#00b8d8] to-[#0099b8] hover:from-[#00a3bf] hover:to-[#0085a1] text-white text-sm font-semibold transition-all shadow-md shadow-[#00b8d8]/20 cursor-pointer"
          >
            <FaPlus className="w-3.5 h-3.5" />
            Add New Banner
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 backdrop-blur-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-200 ml-2">
            <FaTimes />
          </button>
        </div>
      )}
      {success && (
        <div className="p-4 rounded-xl border border-green-500/30 bg-green-500/10 text-green-300 backdrop-blur-sm flex items-center justify-between">
          <span>{success}</span>
          <button onClick={() => setSuccess(null)} className="text-green-400 hover:text-green-200 ml-2">
            <FaTimes />
          </button>
        </div>
      )}

      {/* Guide Banner */}
      <div className="bg-linear-to-r from-[#0a2a5c]/50 via-[#1560a6]/20 to-[#0a2a5c]/50 border border-[#00b8d8]/20 rounded-xl p-5 backdrop-blur-md">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-[#00b8d8]/20 border border-[#00b8d8]/40 flex items-center justify-center shrink-0">
            <FaImage className="w-5 h-5 text-[#00b8d8]" />
          </div>
          <div className="text-sm">
            <h4 className="font-semibold text-white">How Newshub Banners Work</h4>
            <p className="text-gray-300 mt-1">
              Banners added here appear dynamically in the top sliding carousel on{' '}
              <strong className="text-white">https://www.nyaltx.pro/newshub</strong>.
              Recommended banner aspect ratio is <strong>8:3</strong> (e.g. 1600×600 px or minimum 1200×450 px).
              In addition, approved user-submitted paid news that choose the <em>Full Service / Featured Slider</em> plan
              also integrate automatically into the carousel.
            </p>
          </div>
        </div>
      </div>

      {/* Banners List / Grid */}
      {loading ? (
        <div className="text-center py-16">
          <div className="w-12 h-12 border-4 border-[#00b8d8] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading Newshub banners...</p>
        </div>
      ) : banners.length === 0 ? (
        <div className="bg-gray-800/30 border border-gray-700/40 rounded-2xl p-12 text-center">
          <div className="w-16 h-16 bg-gray-800/80 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-700">
            <FaImage className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">No custom Newshub banners yet</h3>
          <p className="text-gray-400 text-sm max-w-md mx-auto mb-6">
            Default platform banners are currently shown on /newshub. Add your first custom promotional banner to take full control of the slider!
          </p>
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-linear-to-r from-[#00b8d8] to-[#0099b8] text-white text-sm font-semibold shadow-lg hover:brightness-110"
          >
            <FaPlus className="w-3.5 h-3.5" />
            Create First Banner
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {banners.map((banner, index) => {
            const hasImg = Boolean(banner.imageUrl);
            const reliableImg = hasImg ? toReliableIpfsUrl(banner.imageUrl) : '';
            const gradient = GRADIENTS[banner.gradientIndex ?? 0] || GRADIENTS[0];

            return (
              <div
                key={banner._id}
                className={`group relative bg-gray-900/60 border rounded-2xl overflow-hidden transition-all duration-200 flex flex-col justify-between ${
                  banner.isActive !== false
                    ? 'border-gray-700/60 hover:border-[#00b8d8]/50 shadow-lg'
                    : 'border-gray-800 opacity-60'
                }`}
              >
                {/* Banner Preview Card */}
                <div>
                  <div
                    className="relative w-full aspect-[8/3] overflow-hidden flex flex-col justify-end p-4 text-white"
                    style={{
                      background: hasImg
                        ? `linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0) 100%), url(${reliableImg}) center/cover no-repeat`
                        : gradient,
                    }}
                  >
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-white/20 backdrop-blur-md text-white border border-white/20">
                        {banner.category || 'NYAX'}
                      </span>
                      {banner.isSponsored && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-400 text-amber-950 flex items-center gap-1 shadow-sm">
                          <FaStar className="w-2.5 h-2.5" />
                          SPONSORED
                        </span>
                      )}
                    </div>

                    <div className="absolute top-3 right-3">
                      <button
                        onClick={() => handleToggleActive(banner)}
                        title={banner.isActive !== false ? 'Deactivate banner' : 'Activate banner'}
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md flex items-center gap-1.5 transition-all ${
                          banner.isActive !== false
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                            : 'bg-gray-800/80 text-gray-400 border border-gray-700 hover:bg-gray-700/80'
                        }`}
                      >
                        {banner.isActive !== false ? (
                          <>
                            <FaToggleOn className="w-4 h-4 text-emerald-400" /> Active
                          </>
                        ) : (
                          <>
                            <FaToggleOff className="w-4 h-4 text-gray-400" /> Inactive
                          </>
                        )}
                      </button>
                    </div>

                    <div className="z-10 mt-6">
                      <h4 className="font-bold text-base line-clamp-2 leading-snug drop-shadow-md">
                        {banner.title}
                      </h4>
                      {banner.description && (
                        <p className="text-xs text-gray-200 line-clamp-1 mt-1 opacity-90 drop-shadow">
                          {banner.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Info details */}
                  <div className="p-4 space-y-2 text-xs text-gray-400">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Display Order:</span>
                      <span className="text-gray-300 font-mono font-semibold">
                        #{banner.displayOrder ?? index + 1}
                      </span>
                    </div>

                    {banner.linkUrl && (
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-gray-500 shrink-0">Target Link:</span>
                        <a
                          href={banner.linkUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#00b8d8] hover:underline truncate text-right"
                        >
                          {banner.linkUrl}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions footer */}
                <div className="p-3 bg-gray-800/30 border-t border-gray-800/80 flex items-center justify-between">
                  <div className="text-[11px] text-gray-500">
                    {hasImg ? 'Custom IPFS Image' : `Gradient Preset #${(banner.gradientIndex ?? 0) + 1}`}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditModal(banner)}
                      className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 transition-colors"
                      title="Edit banner"
                    >
                      <FaEdit className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDeleteBanner(banner)}
                      className="p-2 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/30 transition-colors"
                      title="Delete banner"
                    >
                      <FaTrash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-[#0f172a] border border-gray-700/80 rounded-2xl shadow-2xl p-6 text-white my-8">
            <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-5">
              <div>
                <h3 className="text-xl font-bold">
                  {editingBannerId ? 'Edit Newshub Banner' : 'Add Newshub Banner'}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Configure slider banner details for the /newshub carousel.
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Banner Headline *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NYAX Launches Institutional Staking Rewards"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-gray-900/90 border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#00b8d8]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Short Description / Subtitle
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Explore higher yields and automated compounding on our next-gen platform."
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-gray-900/90 border border-gray-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-[#00b8d8]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Category Tag
                  </label>
                  <select
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-gray-900/90 border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#00b8d8]"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Target Click URL / Slug
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. /news/nyax-staking or https://nyaltx.pro/..."
                    value={form.linkUrl}
                    onChange={e => setForm({ ...form, linkUrl: e.target.value })}
                    className="w-full bg-gray-900/90 border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#00b8d8]"
                  />
                </div>
              </div>

              {/* Image Upload / IPFS */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Banner Image (1600×600 px recommended, 8:3 ratio)
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <label className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-[#00b8d8]/50 bg-[#00b8d8]/10 hover:bg-[#00b8d8]/20 text-[#00b8d8] text-sm font-semibold cursor-pointer transition-colors">
                    <FaUpload />
                    {uploadingImage ? 'Uploading to IPFS...' : 'Upload Image'}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageFileUpload}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                  </label>

                  <span className="text-xs text-gray-500">or enter image URL:</span>

                  <input
                    type="text"
                    placeholder="https://..."
                    value={form.imageUrl}
                    onChange={e => setForm({ ...form, imageUrl: e.target.value })}
                    className="w-full sm:flex-1 bg-gray-900/90 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00b8d8]"
                  />
                </div>
              </div>

              {/* Gradient fallback picker */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Gradient Theme (used if no custom image is provided)
                </label>
                <div className="flex items-center gap-3">
                  {GRADIENTS.map((g, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setForm({ ...form, gradientIndex: idx })}
                      className={`w-10 h-8 rounded-lg cursor-pointer transition-all border-2 ${
                        form.gradientIndex === idx ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-80 hover:opacity-100'
                      }`}
                      style={{ background: g }}
                    />
                  ))}
                  {form.imageUrl && (
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, imageUrl: '' })}
                      className="text-xs text-gray-400 hover:text-red-400 underline ml-2"
                    >
                      Clear image &amp; use gradient
                    </button>
                  )}
                </div>
              </div>

              {/* Live Preview */}
              <div>
                <div className="text-xs font-semibold text-gray-400 mb-1.5">Live Banner Preview</div>
                <div
                  className="w-full aspect-[8/3] rounded-xl overflow-hidden p-5 flex flex-col justify-end text-white border border-gray-700 relative"
                  style={{
                    background: form.imageUrl
                      ? `linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0) 100%), url(${toReliableIpfsUrl(
                          form.imageUrl
                        )}) center/cover no-repeat`
                      : GRADIENTS[form.gradientIndex] || GRADIENTS[0],
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-white/20 backdrop-blur-md">
                      {form.category || 'NYAX'}
                    </span>
                    {form.isSponsored && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-400 text-amber-950 flex items-center gap-1 shadow-sm">
                        <FaStar className="w-2.5 h-2.5" />
                        SPONSORED
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold line-clamp-1 drop-shadow-md">
                    {form.title || 'Your Banner Title Preview'}
                  </h3>
                  <p className="text-xs text-gray-200 opacity-90 line-clamp-1 mt-0.5 drop-shadow">
                    {form.description || 'Short subtitle or excerpt preview here...'}
                  </p>
                </div>
              </div>

              {/* Additional Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-gray-800">
                <label className="flex items-center gap-2.5 text-xs text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isSponsored}
                    onChange={e => setForm({ ...form, isSponsored: e.target.checked })}
                    className="w-4 h-4 rounded text-[#00b8d8] bg-gray-900 border-gray-700 focus:ring-0"
                  />
                  <span>Mark as Sponsored</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={e => setForm({ ...form, isActive: e.target.checked })}
                    className="w-4 h-4 rounded text-[#00b8d8] bg-gray-900 border-gray-700 focus:ring-0"
                  />
                  <span>Banner is Active</span>
                </label>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">Display Order:</span>
                  <input
                    type="number"
                    value={form.displayOrder}
                    onChange={e => setForm({ ...form, displayOrder: parseInt(e.target.value) || 0 })}
                    className="w-20 bg-gray-900 border border-gray-700 rounded-lg px-2 py-1 text-xs text-white"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting || uploadingImage}
                  className="px-5 py-2 rounded-xl bg-linear-to-r from-[#00b8d8] to-[#0099b8] hover:from-[#00a3bf] hover:to-[#0085a1] text-white text-sm font-semibold transition-all shadow-md shadow-[#00b8d8]/20 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingBannerId ? 'Update Banner' : 'Save Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminNewshubBannersClient;
