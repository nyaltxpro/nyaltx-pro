"use client";

import React, { useState, useEffect } from 'react';
import { FaUpload, FaTrash, FaEye, FaCopy } from 'react-icons/fa';

interface BannerFile {
  name: string;
  path: string;
  size: number;
  lastModified: string;
  url: string;
}

export default function BannerManagementPage() {
  const [banners, setBanners] = useState<BannerFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/banners');
      if (!response.ok) throw new Error('Failed to load banners');
      const data = await response.json();
      setBanners(data.banners || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('banners', file);
      });

      const response = await fetch('/api/admin/banners', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();
      setSuccess(`Successfully uploaded ${result.uploaded} banner(s)`);
      loadBanners(); // Reload the list
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const handleDelete = async (filename: string) => {
    if (!confirm(`Are you sure you want to delete ${filename}?`)) return;

    try {
      const response = await fetch('/api/admin/banners', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Delete failed');
      }

      setSuccess(`Successfully deleted ${filename}`);
      loadBanners(); // Reload the list
    } catch (err: any) {
      setError(err.message);
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    setSuccess('URL copied to clipboard!');
    setTimeout(() => setSuccess(null), 2000);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Banner Management</h2>
        <div className="relative">
          <input
            type="file"
            id="banner-upload"
            multiple
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            disabled={uploading}
          />
          <label
            htmlFor="banner-upload"
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-700 bg-blue-600 hover:bg-blue-500 text-white cursor-pointer transition-colors ${
              uploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <FaUpload />
            {uploading ? 'Uploading...' : 'Upload Banners'}
          </label>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="p-3 rounded-md border border-red-500 bg-red-900/30 text-red-200">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 rounded-md border border-green-500 bg-green-900/30 text-green-200">
          {success}
        </div>
      )}

      {/* Upload Instructions */}
      <div className="rounded-xl border border-gray-800 p-6 bg-gray-900/50">
        <h3 className="font-semibold mb-2">Upload Instructions</h3>
        <ul className="text-sm text-gray-400 space-y-1">
          <li>• Supported formats: JPG, PNG, GIF, WebP</li>
          <li>• Recommended size: 1920x1080 or similar aspect ratio</li>
          <li>• Files will be stored in the public/banner/ directory</li>
          <li>• Use descriptive filenames (e.g., race-to-liberty-main.png)</li>
        </ul>
      </div>

      {/* Banner List */}
      <div className="rounded-xl border border-gray-800 p-6">
        <h3 className="font-semibold mb-4">Current Banners</h3>
        
        {loading ? (
          <div className="text-gray-400">Loading banners...</div>
        ) : banners.length === 0 ? (
          <div className="text-gray-400">No banners found. Upload some banners to get started.</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {banners.map((banner) => (
              <div key={banner.name} className="border border-gray-700 rounded-lg overflow-hidden bg-gray-800">
                {/* Image Preview */}
                <div className="aspect-video bg-gray-900 relative">
                  <img
                    src={banner.url}
                    alt={banner.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-banner.png';
                    }}
                  />
                </div>
                
                {/* Banner Info */}
                <div className="p-4">
                  <h4 className="font-medium text-sm mb-2 truncate" title={banner.name}>
                    {banner.name}
                  </h4>
                  <div className="text-xs text-gray-400 space-y-1">
                    <div>Size: {formatFileSize(banner.size)}</div>
                    <div>Modified: {new Date(banner.lastModified).toLocaleDateString()}</div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => window.open(banner.url, '_blank')}
                      className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded"
                      title="View full size"
                    >
                      <FaEye />
                      View
                    </button>
                    <button
                      onClick={() => copyToClipboard(banner.url)}
                      className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs bg-blue-700 hover:bg-blue-600 rounded"
                      title="Copy URL"
                    >
                      <FaCopy />
                      Copy
                    </button>
                    <button
                      onClick={() => handleDelete(banner.name)}
                      className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs bg-red-700 hover:bg-red-600 rounded"
                      title="Delete banner"
                    >
                      <FaTrash />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Usage Examples */}
      <div className="rounded-xl border border-gray-800 p-6 bg-gray-900/50">
        <h3 className="font-semibold mb-2">Usage Examples</h3>
        <div className="text-sm text-gray-400 space-y-2">
          <div>
            <code className="bg-gray-800 px-2 py-1 rounded text-xs">
              &lt;Image src="/banner/your-banner.png" alt="Banner" width={1920} height={1080} /&gt;
            </code>
          </div>
          <div>
            <code className="bg-gray-800 px-2 py-1 rounded text-xs">
              background-image: url('/banner/your-banner.png')
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}
