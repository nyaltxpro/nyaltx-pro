'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { FaCopy, FaEye, FaTrash, FaUpload, FaImage, FaDownload } from 'react-icons/fa';

const AdminBannersClient = dynamic(() => Promise.resolve(AdminBannersComponent), {
    ssr: false,
    loading: () => (
        <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaImage className="w-8 h-8 text-gray-400 animate-pulse" />
            </div>
            <p className="text-gray-400 font-medium" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                Loading banners...
            </p>
        </div>
    )
});

interface BannerFile {
    name: string;
    path: string;
    size: number;
    lastModified: string;
    url: string;
}

interface BannerMetadata {
    bannerName: string;
    hyperlink: string;
    title: string;
    description: string;
}

function AdminBannersComponent() {
    const [banners, setBanners] = useState<BannerFile[]>([]);
    const [bannerMetadata, setBannerMetadata] = useState<BannerMetadata[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [editingMetadata, setEditingMetadata] = useState<string | null>(null);
    const [metadataForm, setMetadataForm] = useState({
        hyperlink: '',
        title: '',
        description: ''
    });

    useEffect(() => {
        loadBanners();
    }, []);

    const loadBanners = async () => {
        try {
            setLoading(true);
            
            // Load banners
            const bannersResponse = await fetch('/api/admin/banners');
            if (!bannersResponse.ok) throw new Error('Failed to load banners');
            const bannersData = await bannersResponse.json();
            setBanners(bannersData.banners || []);

            // Load banner metadata
            const metadataResponse = await fetch('/api/admin/banners/metadata');
            if (metadataResponse.ok) {
                const metadataData = await metadataResponse.json();
                setBannerMetadata(metadataData.bannerMetadata || []);
            }
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
            // Validate each file before upload
            for (const file of Array.from(files)) {
                const validationFormData = new FormData();
                validationFormData.append('file', file);

                const validationResponse = await fetch('/api/admin/banners/validate', {
                    method: 'POST',
                    body: validationFormData,
                });

                const validationResult = await validationResponse.json();
                if (!validationResult.valid) {
                    throw new Error(`${file.name}: ${validationResult.error}`);
                }
            }

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

    const handleEditMetadata = (bannerName: string) => {
        const existingMetadata = bannerMetadata.find(meta => meta.bannerName === bannerName);
        setMetadataForm({
            hyperlink: existingMetadata?.hyperlink || '',
            title: existingMetadata?.title || '',
            description: existingMetadata?.description || ''
        });
        setEditingMetadata(bannerName);
    };

    const handleSaveMetadata = async () => {
        if (!editingMetadata) return;

        try {
            const response = await fetch('/api/admin/banners/metadata', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bannerName: editingMetadata,
                    ...metadataForm
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save metadata');
            }

            setSuccess('Banner metadata saved successfully!');
            setEditingMetadata(null);
            loadBanners(); // Reload to get updated metadata
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleCancelEdit = () => {
        setEditingMetadata(null);
        setMetadataForm({ hyperlink: '', title: '', description: '' });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-semibold text-white" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                        Banner Management
                    </h2>
                    <p className="text-gray-400 text-sm mt-1" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                        Manage promotional banners and images
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/admin" className="text-sm text-gray-300 hover:text-white transition-colors" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                        Back to Dashboard
                    </Link>
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
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-blue-500/30 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 cursor-pointer transition-all duration-200 font-medium ${uploading ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                        >
                            <FaUpload className="w-4 h-4" />
                            {uploading ? 'Uploading...' : 'Upload Banners'}
                        </label>
                    </div>
                </div>
            </div>

            {/* Status Messages */}
            {error && (
                <div className="p-4 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                        <span className="font-medium" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                            {error}
                        </span>
                    </div>
                </div>
            )}
            {success && (
                <div className="p-4 rounded-lg border border-green-500/30 bg-green-500/10 text-green-300 backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="font-medium" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                            {success}
                        </span>
                    </div>
                </div>
            )}

            {/* Upload Instructions */}
            <div className="bg-gray-800/40 backdrop-blur-lg border border-gray-700/20 rounded-lg p-6 shadow-xl">
                <h3 className="font-semibold mb-4 text-white flex items-center gap-2" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                    <FaImage className="w-5 h-5 text-blue-400" />
                    Upload Instructions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <h4 className="text-sm font-medium text-gray-300 mb-2" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                            Supported Formats
                        </h4>
                        <ul className="text-sm text-gray-400 space-y-1" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                            <li className="flex items-center gap-2">
                                <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                                JPG, PNG, GIF, WebP
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                                Max file size: 10MB
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-sm font-medium text-gray-300 mb-2" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                            Best Practices
                        </h4>
                        <ul className="text-sm text-gray-400 space-y-1" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                            <li className="flex items-center gap-2">
                                <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                                Recommended: 1920x1080px
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                                Use descriptive filenames
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Banner List */}
            <div className="bg-gray-800/40 backdrop-blur-lg border border-gray-700/20 rounded-lg shadow-xl">
                <div className="p-6 border-b border-gray-700/20">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-white flex items-center gap-2" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                            <FaImage className="w-5 h-5 text-cyan-400" />
                            Current Banners
                            {banners.length > 0 && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                                    {banners.length}
                                </span>
                            )}
                        </h3>
                    </div>
                </div>

                <div className="p-6">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FaImage className="w-8 h-8 text-gray-400 animate-pulse" />
                            </div>
                            <p className="text-gray-400 font-medium" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                Loading banners...
                            </p>
                        </div>
                    ) : banners.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FaImage className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-gray-400 font-medium mb-2" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                No banners found
                            </p>
                            <p className="text-gray-500 text-sm" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                Upload some banners to get started
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {banners.map(banner => (
                                <div
                                    key={banner.name}
                                    className="bg-gray-700/30 border border-gray-600/30 rounded-lg overflow-hidden hover:bg-gray-700/40 transition-all duration-200 group"
                                >
                                    {/* Image Preview */}
                                    <div className="aspect-video bg-gray-900/50 relative overflow-hidden">
                                        <img
                                            src={banner.url}
                                            alt={banner.name}
                                            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                                            onError={e => {
                                                (e.target as HTMLImageElement).src = '/placeholder-banner.png';
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                                    </div>

                                    {/* Banner Info */}
                                    <div className="p-4">
                                        <h4 className="font-medium text-sm mb-3 text-white truncate" title={banner.name} style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                            {banner.name}
                                        </h4>
                                        
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                                    <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                                                    <span style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                                        {formatFileSize(banner.size)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                                    <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                                                    <span style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                                        {new Date(banner.lastModified).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Banner Metadata */}
                                        {(() => {
                                            const metadata = bannerMetadata.find(meta => meta.bannerName === banner.name);
                                            return metadata ? (
                                                <div className="mb-3 p-2 bg-gray-800/30 rounded-lg border border-gray-600/20">
                                                    <div className="text-xs text-gray-400 mb-1">Hyperlink:</div>
                                                    <div className="text-xs text-blue-300 truncate">{metadata.hyperlink || 'Not set'}</div>
                                                    {metadata.title && (
                                                        <>
                                                            <div className="text-xs text-gray-400 mt-1 mb-1">Title:</div>
                                                            <div className="text-xs text-white truncate">{metadata.title}</div>
                                                        </>
                                                    )}
                                                </div>
                                            ) : null;
                                        })()}

                                        {/* Actions */}
                                        <div className="flex gap-2 mb-2">
                                            <button
                                                onClick={() => window.open(banner.url, '_blank')}
                                                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium bg-gray-500/20 hover:bg-gray-500/30 text-gray-300 border border-gray-500/30 rounded-lg transition-all duration-200"
                                                title="View full size"
                                                style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                                            >
                                                <FaEye className="w-3 h-3" />
                                                View
                                            </button>
                                            <button
                                                onClick={() => copyToClipboard(banner.url)}
                                                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 rounded-lg transition-all duration-200"
                                                title="Copy URL"
                                                style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                                            >
                                                <FaCopy className="w-3 h-3" />
                                                Copy
                                            </button>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEditMetadata(banner.name)}
                                                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/30 rounded-lg transition-all duration-200"
                                                title="Edit hyperlink & metadata"
                                                style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                                            >
                                                <FaUpload className="w-3 h-3" />
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(banner.name)}
                                                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 rounded-lg transition-all duration-200"
                                                title="Delete banner"
                                                style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                                            >
                                                <FaTrash className="w-3 h-3" />
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Metadata Edit Modal */}
            {editingMetadata && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-gray-800/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <h3 className="text-xl font-semibold text-white mb-4" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                            Edit Banner Metadata
                        </h3>
                        <p className="text-gray-400 text-sm mb-4" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                            Configure hyperlink and display information for: <span className="text-white font-medium">{editingMetadata}</span>
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                    Hyperlink URL
                                </label>
                                <input
                                    type="url"
                                    value={metadataForm.hyperlink}
                                    onChange={(e) => setMetadataForm(prev => ({ ...prev, hyperlink: e.target.value }))}
                                    placeholder="https://example.com or /pricing"
                                    className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#00d4aa]/50 focus:ring-1 focus:ring-[#00d4aa]/20 transition-all duration-200"
                                    style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                    Display Title
                                </label>
                                <input
                                    type="text"
                                    value={metadataForm.title}
                                    onChange={(e) => setMetadataForm(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="Welcome to NYALTX"
                                    className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#00d4aa]/50 focus:ring-1 focus:ring-[#00d4aa]/20 transition-all duration-200"
                                    style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                    Description
                                </label>
                                <input
                                    type="text"
                                    value={metadataForm.description}
                                    onChange={(e) => setMetadataForm(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Your crypto trading platform"
                                    className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#00d4aa]/50 focus:ring-1 focus:ring-[#00d4aa]/20 transition-all duration-200"
                                    style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={handleCancelEdit}
                                className="flex-1 px-4 py-2 bg-gray-600/50 hover:bg-gray-600/70 text-gray-300 rounded-lg transition-all duration-200 font-medium"
                                style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveMetadata}
                                className="flex-1 px-4 py-2 bg-gradient-to-r from-[#00d4aa] to-[#3b82f6] hover:from-[#00d4aa]/80 hover:to-[#3b82f6]/80 text-white rounded-lg transition-all duration-200 font-medium"
                                style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                            >
                                Save Metadata
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Usage Examples */}
        </div>
    );
}

export default function BannerManagementPage() {
    return <AdminBannersClient />;
}
