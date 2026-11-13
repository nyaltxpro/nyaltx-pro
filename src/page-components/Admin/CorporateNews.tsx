'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import type QuillType from 'quill';
import type { QuillOptions } from 'quill';
import 'quill/dist/quill.snow.css';
import React, { useEffect, useRef, useState } from 'react';
import { FaClock, FaEdit, FaEye, FaNewspaper, FaPlus, FaSpinner, FaTags, FaTrash, FaUpload, FaUser } from 'react-icons/fa';
import { toReliableIpfsUrl } from '@/utils/ipfsUpload';

const AdminCorporateNewsClient = dynamic(() => Promise.resolve(AdminCorporateNewsComponent), {
    ssr: false,
    loading: () => (
        <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaNewspaper className="w-8 h-8 text-gray-400 animate-pulse" />
            </div>
            <p className="text-gray-400 font-medium" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                Loading news management...
            </p>
        </div>
    )
});

const quillModules: NonNullable<QuillOptions['modules']> = {
    toolbar: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ script: 'sub' }, { script: 'super' }],
        [{ indent: '-1' }, { indent: '+1' }],
        [{ color: [] }, { background: [] }],
        [{ align: [] }],
        ['link', 'blockquote', 'code-block'],
        ['clean'],
    ],
};

const quillFormats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'blockquote',
    'code-block',
    'list',
    'bullet',
    'indent',
    'script',
    'align',
    'link',
    'color',
    'background',
];

const normalizeQuillHtml = (value?: string | null) => {
    if (!value) return '';
    const trimmed = value.replace(/\s+$/, '');
    if (trimmed === '<p><br></p>') return '';
    return trimmed;
};

interface NewsArticle {
    _id: string;
    title: string;
    content: string;
    excerpt: string;
    featuredImage?: string;
    status: 'published' | 'draft' | 'pending';
    featuredInBanner?: boolean;
    publishedAt?: Date;
    tags: string[];
    author: string;
    slug: string;
    createdAt: Date;
    updatedAt: Date;
    views: number;
    // Payment & submission details
    type?: 'news' | 'pr';
    plan?: string;
    planName?: string;
    paymentMethod?: string;
    amount?: number;
    paymentId?: string;
    txHash?: string;
    walletAddress?: string;
    paymentStatus?: string;
    email?: string;
}

function AdminCorporateNewsComponent() {
    const [news, setNews] = useState<NewsArticle[]>([]);
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'published' | 'draft'>('all');
    const [approvingId, setApprovingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [editingNews, setEditingNews] = useState<NewsArticle | null>(null);
    const [newsForm, setNewsForm] = useState({
        title: '',
        content: '',
        excerpt: '',
        featuredImage: '',
        status: 'draft' as 'published' | 'draft' | 'pending',
        featuredInBanner: false,
        tags: '',
        author: 'NYALTX Team',
        editorType: 'quill' as 'simple' | 'quill'
    });

    // IPFS upload state
    const [isUploadingToIPFS, setIsUploadingToIPFS] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // Quill editor state
    const quillContainerRef = useRef<HTMLDivElement | null>(null);
    const quillInstanceRef = useRef<QuillType | null>(null);
    const quillChangeHandlerRef = useRef<((delta: unknown, oldDelta: unknown, source: string) => void) | null>(null);
    const suppressQuillChangeRef = useRef(false);
    const [isQuillLoading, setIsQuillLoading] = useState(false);

    useEffect(() => {
        const teardown = () => {
            const existing = quillInstanceRef.current;
            if (existing && quillChangeHandlerRef.current) {
                existing.off('text-change', quillChangeHandlerRef.current);
            }
            quillInstanceRef.current = null;
            quillChangeHandlerRef.current = null;
            suppressQuillChangeRef.current = false;
            setIsQuillLoading(false);
        };

        if (!isCreating || newsForm.editorType !== 'quill') {
            teardown();
            return teardown;
        }

        let isCancelled = false;

        const initializeQuill = async () => {
            const container = quillContainerRef.current;
            if (!container) return;
            if (quillInstanceRef.current) return;

            setIsQuillLoading(true);

            container.innerHTML = '';

            const { default: Quill } = await import('quill');
            if (isCancelled) return;

            const quill = new Quill(container, {
                theme: 'snow',
                modules: quillModules,
                formats: quillFormats,
                placeholder: 'Write your news article content here...'
            });

            quillInstanceRef.current = quill;

            const handler = (_delta: unknown, _oldDelta: unknown, source: string) => {
                if (suppressQuillChangeRef.current || source !== 'user') return;
                const html = normalizeQuillHtml(quill.root.innerHTML);
                setNewsForm(prev => (prev.content === html ? prev : { ...prev, content: html }));
            };

            quillChangeHandlerRef.current = handler;
            quill.on('text-change', handler);

            const startingContent = normalizeQuillHtml(newsForm.content || '');
            suppressQuillChangeRef.current = true;
            quill.clipboard.dangerouslyPasteHTML(startingContent);
            quill.history.clear();
            suppressQuillChangeRef.current = false;

            setIsQuillLoading(false);
        };

        void initializeQuill();

        return () => {
            isCancelled = true;
            teardown();
        };
    }, [isCreating, newsForm.editorType]);

    useEffect(() => {
        if (!isCreating || newsForm.editorType !== 'quill') return;
        const quill = quillInstanceRef.current;
        if (!quill) return;

        const desired = normalizeQuillHtml(newsForm.content || '');
        const current = normalizeQuillHtml(quill.root.innerHTML);

        if (desired === current) return;

        suppressQuillChangeRef.current = true;
        quill.clipboard.dangerouslyPasteHTML(desired);
        quill.history.clear();
        suppressQuillChangeRef.current = false;
    }, [newsForm.content, isCreating, newsForm.editorType]);

    useEffect(() => {
        loadNews();
    }, []);

    const loadNews = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/news?status=all&limit=50');
            if (!response.ok) throw new Error('Failed to load news');
            const data = await response.json();
            setNews(data.news || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateNews = () => {
        setIsCreating(true);
        setEditingNews(null);
        setNewsForm({
            title: '',
            content: '',
            excerpt: '',
            featuredImage: '',
            status: 'draft',
            featuredInBanner: false,
            tags: '',
            author: 'NYALTX Team',
            editorType: 'quill'
        });
    };

    const handleEditNews = (article: NewsArticle) => {
        setEditingNews(article);
        setIsCreating(true);
        setNewsForm({
            title: article.title,
            content: article.content,
            excerpt: article.excerpt,
            featuredImage: article.featuredImage || '',
            status: article.status,
            featuredInBanner: Boolean(article.featuredInBanner),
            tags: article.tags.join(', '),
            author: article.author,
            editorType: 'quill' // Default to quill for existing articles
        });
    };

    const handleToggleBanner = async (article: NewsArticle) => {
        try {
            const nextState = !article.featuredInBanner;
            const response = await fetch('/api/admin/news', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: article._id, featuredInBanner: nextState })
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || 'Failed to update banner status');
            }

            setSuccess(nextState ? `"${article.title}" added to Top Banner Slider!` : `"${article.title}" removed from Top Banner Slider.`);
            loadNews();
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleApproveNews = async (article: NewsArticle) => {
        try {
            setApprovingId(article._id);
            const shouldBeInBanner = article.plan === 'slider' || article.plan === 'prem' || Boolean(article.featuredInBanner);
            const response = await fetch('/api/admin/news', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: article._id,
                    status: 'published',
                    publishedAt: new Date().toISOString(),
                    featuredInBanner: shouldBeInBanner
                })
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || 'Failed to approve article');
            }

            setSuccess(`✓ "${article.title}" approved and published live to NYALTX News Hub!`);
            await loadNews();
        } catch (err: any) {
            setError(err.message || 'Error approving news article');
        } finally {
            setApprovingId(null);
        }
    };

    const handleSaveNews = async () => {
        try {
            const tagsArray = newsForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag);

            const newsData = {
                ...newsForm,
                tags: tagsArray,
                publishedAt: newsForm.status === 'published' ? new Date().toISOString() : null
            };

            console.log('Saving news article:', { editingNews: !!editingNews, newsData });

            let response;
            if (editingNews) {
                console.log('Updating article with ID:', editingNews._id);
                response = await fetch('/api/admin/news', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: editingNews._id, ...newsData })
                });
            } else {
                console.log('Creating new article');
                response = await fetch('/api/admin/news', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newsData)
                });
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save news');
            }

            setSuccess(editingNews ? 'News article updated successfully!' : 'News article created successfully!');
            setIsCreating(false);
            setEditingNews(null);
            loadNews();
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleDeleteNews = async (id: string) => {
        if (!confirm('Are you sure you want to delete this news article?')) return;

        try {
            console.log('Deleting article with ID:', id);
            const response = await fetch('/api/admin/news', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete news');
            }

            setSuccess('News article deleted successfully!');
            loadNews();
        } catch (err: any) {
            setError(err.message);
        }
    };

    // IPFS upload function
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Validate file type
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                setError('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
                return;
            }

            // Validate file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                setError('File size must be less than 10MB');
                return;
            }

            // Validate image dimensions
            const img = new Image();
            const objectUrl = URL.createObjectURL(file);

            img.onload = () => {
                URL.revokeObjectURL(objectUrl);

                if (img.width < 400 || img.height < 200) {
                    setError(`Image dimensions must be at least 400x200 pixels. Current image is ${img.width}x${img.height} pixels.`);
                    // Clear the file input
                    const fileInput = document.getElementById('ipfs-file-input') as HTMLInputElement;
                    if (fileInput) fileInput.value = '';
                    return;
                }

                setSelectedFile(file);
                setError(null);
            };

            img.onerror = () => {
                URL.revokeObjectURL(objectUrl);
                setError('Failed to load image. Please select a valid image file.');
                // Clear the file input
                const fileInput = document.getElementById('ipfs-file-input') as HTMLInputElement;
                if (fileInput) fileInput.value = '';
            };

            img.src = objectUrl;
        }
    };

    const uploadToIPFS = async () => {
        if (!selectedFile) {
            setError('Please select a file first');
            return;
        }

        setIsUploadingToIPFS(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('file', selectedFile);

            const response = await fetch('/api/upload/ipfs', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to upload to IPFS');
            }

            const data = await response.json();
            const ipfsUrl = data.url || `https://gateway.pinata.cloud/ipfs/${data.hash}`;

            // Update the featured image field with IPFS URL
            setNewsForm(prev => ({ ...prev, featuredImage: ipfsUrl }));
            setSuccess(`Image uploaded to IPFS successfully! Hash: ${data.hash}`);
            setSelectedFile(null);

            // Clear the file input
            const fileInput = document.getElementById('ipfs-file-input') as HTMLInputElement;
            if (fileInput) fileInput.value = '';

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsUploadingToIPFS(false);
        }
    };

    const handleCancel = () => {
        setIsCreating(false);
        setEditingNews(null);
        setSelectedFile(null);
        setIsUploadingToIPFS(false);
        setNewsForm({
            title: '',
            content: '',
            excerpt: '',
            featuredImage: '',
            status: 'draft',
            tags: '',
            author: 'NYALTX Team',
            editorType: 'quill'
        });
    };

    const formatDate = (date: Date | string) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-semibold text-white" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                        Corporate News Management
                    </h2>
                    <p className="text-gray-400 text-sm mt-1" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                        Manage corporate news articles and announcements
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/admin" className="text-sm text-gray-300 hover:text-white transition-colors" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                        Back to Dashboard
                    </Link>
                    <button
                        onClick={handleCreateNews}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-green-500/30 bg-green-500/20 hover:bg-green-500/30 text-green-300 transition-all duration-200 font-medium"
                        style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                    >
                        <FaPlus className="w-4 h-4" />
                        Create News Article
                    </button>
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

            {/* Create/Edit Form */}
            {isCreating && (
                <div className="bg-gray-800/40 backdrop-blur-lg border border-gray-700/20 rounded-lg p-6 shadow-xl">
                    <h3 className="font-semibold mb-4 text-white flex items-center gap-2" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                        <FaNewspaper className="w-5 h-5 text-blue-400" />
                        {editingNews ? 'Edit News Article' : 'Create New News Article'}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Title *</label>
                            <input
                                type="text"
                                value={newsForm.title}
                                onChange={(e) => setNewsForm(prev => ({ ...prev, title: e.target.value }))}
                                className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50"
                                placeholder="Enter news title"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Author</label>
                            <input
                                type="text"
                                value={newsForm.author}
                                onChange={(e) => setNewsForm(prev => ({ ...prev, author: e.target.value }))}
                                className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50"
                                placeholder="Author name"
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-300 mb-2">Excerpt</label>
                        <textarea
                            value={newsForm.excerpt}
                            onChange={(e) => setNewsForm(prev => ({ ...prev, excerpt: e.target.value }))}
                            rows={2}
                            className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50"
                            placeholder="Brief description (optional - will be auto-generated from content)"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-300 mb-2">Editor Type</label>
                        <select
                            value={newsForm.editorType}
                            onChange={(e) => {
                                const newEditorType = e.target.value as 'simple' | 'quill';
                                if (newEditorType === newsForm.editorType) return;

                                if (quillInstanceRef.current && newsForm.editorType === 'quill') {
                                    const html = normalizeQuillHtml(quillInstanceRef.current.root.innerHTML);
                                    setNewsForm(prev => ({ ...prev, content: html, editorType: newEditorType }));
                                } else {
                                    setNewsForm(prev => ({ ...prev, editorType: newEditorType }));
                                }
                            }}
                            className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:border-blue-500/50"
                        >
                            <option value="simple">Simple Text</option>
                            <option value="quill">Rich Text (Quill)</option>
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-300 mb-2">Content *</label>
                        {newsForm.editorType === 'simple' ? (
                            <textarea
                                value={newsForm.content}
                                onChange={(e) => setNewsForm(prev => ({ ...prev, content: e.target.value }))}
                                rows={8}
                                className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50"
                                placeholder="Write your news article content here..."
                            />
                        ) : (
                            <div className="quill-dark relative overflow-hidden rounded-xl">
                                {isQuillLoading && (
                                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm">
                                        <div className="text-center">
                                            <FaSpinner className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-4" />
                                            <p className="text-gray-300">Loading rich text editor...</p>
                                        </div>
                                    </div>
                                )}
                                <div
                                    ref={quillContainerRef}
                                    className={`quill-editor ${isQuillLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
                                    style={{ minHeight: '320px' }}
                                />
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-300 mb-2">Featured Image</label>

                            {/* IPFS Upload Section */}
                            <div className="mb-3 p-4 bg-gray-700/30 border border-gray-600/30 rounded-lg">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-sm font-medium text-cyan-300">Upload to IPFS</span>
                                    <div className="flex-1 h-px bg-gray-600/50"></div>
                                </div>
                                <div className="mb-3 text-xs text-gray-400">
                                    Requirements: Min 400x300 pixels, Max 10MB, JPEG/PNG/GIF/WebP only
                                </div>

                                <div className="flex items-center gap-3">
                                    <input
                                        id="ipfs-file-input"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                    />
                                    <label
                                        htmlFor="ipfs-file-input"
                                        className="flex items-center gap-2 px-3 py-2 bg-gray-600/50 hover:bg-gray-600/70 text-gray-300 rounded-lg cursor-pointer transition-all duration-200 text-sm"
                                    >
                                        <FaUpload className="w-4 h-4" />
                                        Choose File
                                    </label>

                                    {selectedFile && (
                                        <span className="text-sm text-gray-400 flex-1 truncate">
                                            {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                                        </span>
                                    )}

                                    <button
                                        type="button"
                                        onClick={uploadToIPFS}
                                        disabled={!selectedFile || isUploadingToIPFS}
                                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 text-sm font-medium"
                                    >
                                        {isUploadingToIPFS ? (
                                            <>
                                                <FaSpinner className="w-4 h-4 animate-spin" />
                                                Uploading...
                                            </>
                                        ) : (
                                            <>
                                                <FaUpload className="w-4 h-4" />
                                                Upload to IPFS
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Manual URL Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Or enter image URL manually</label>
                                <div className="flex gap-2">
                                    <input
                                        type="url"
                                        value={newsForm.featuredImage}
                                        onChange={(e) => setNewsForm(prev => ({ ...prev, featuredImage: e.target.value }))}
                                        className="flex-1 px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50"
                                        placeholder="https://example.com/image.jpg or IPFS URL"
                                    />
                                    {newsForm.featuredImage.includes('gateway.pinata.cloud') && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const fixedUrl = convertToWorkingIPFSUrl(newsForm.featuredImage);
                                                setNewsForm(prev => ({ ...prev, featuredImage: fixedUrl }));
                                                setSuccess('URL converted to working IPFS gateway!');
                                            }}
                                            className="px-3 py-2 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-300 rounded-lg border border-yellow-600/30 transition-all duration-200 text-sm font-medium whitespace-nowrap"
                                            title="Convert Pinata gateway URL to working IPFS.io gateway"
                                        >
                                            Fix URL
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Image Preview */}
                            {newsForm.featuredImage && (
                                <div className="mt-3">
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Preview</label>
                                    <div className="relative w-full h-32 bg-gray-800/50 rounded-lg overflow-hidden">
                                        <img
                                            src={newsForm.featuredImage}
                                            alt="Featured image preview"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.style.display = 'none';
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                            <select
                                value={newsForm.status}
                                onChange={(e) => setNewsForm(prev => ({ ...prev, status: e.target.value as 'published' | 'draft' | 'pending' }))}
                                className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:border-blue-500/50"
                            >
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                                <option value="pending">Pending Review</option>
                            </select>
                            <label className="flex items-center gap-2 mt-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={newsForm.featuredInBanner}
                                    onChange={(e) => setNewsForm(prev => ({ ...prev, featuredInBanner: e.target.checked }))}
                                    className="rounded border-gray-600 text-cyan-500 focus:ring-cyan-500"
                                />
                                <span className="text-xs font-medium text-yellow-300">★ Feature in Top Banner Slider</span>
                            </label>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Tags</label>
                            <input
                                type="text"
                                value={newsForm.tags}
                                onChange={(e) => setNewsForm(prev => ({ ...prev, tags: e.target.value }))}
                                className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50"
                                placeholder="announcement, partnership, update"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={handleCancel}
                            className="px-4 py-2 bg-gray-600/50 hover:bg-gray-600/70 text-gray-300 rounded-lg transition-all duration-200 font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSaveNews}
                            disabled={!newsForm.title || !newsForm.content}
                            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 font-medium"
                        >
                            {editingNews ? 'Update Article' : 'Create Article'}
                        </button>
                    </div>
                </div>
            )}

            {/* News List */}
            <div className="bg-gray-800/40 backdrop-blur-lg border border-gray-700/20 rounded-lg shadow-xl">
                <div className="p-6 border-b border-gray-700/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h3 className="font-semibold text-white flex items-center gap-2" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                        <FaNewspaper className="w-5 h-5 text-cyan-400" />
                        News Articles & Submissions
                        {news.length > 0 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                                {news.length}
                            </span>
                        )}
                    </h3>

                    {/* Status Filter Tabs */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <button
                            onClick={() => setStatusFilter('all')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                statusFilter === 'all'
                                    ? 'bg-cyan-500 text-black font-semibold shadow-md'
                                    : 'bg-gray-700/50 hover:bg-gray-700/80 text-gray-300'
                            }`}
                        >
                            All ({news.length})
                        </button>
                        <button
                            onClick={() => setStatusFilter('pending')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                                statusFilter === 'pending'
                                    ? 'bg-amber-500 text-black font-bold shadow-md'
                                    : news.filter(n => n.status === 'pending').length > 0
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                                    : 'bg-gray-700/50 hover:bg-gray-700/80 text-gray-300'
                            }`}
                        >
                            <span>Pending Review</span>
                            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/30 font-bold">
                                {news.filter(n => n.status === 'pending').length}
                            </span>
                        </button>
                        <button
                            onClick={() => setStatusFilter('published')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                statusFilter === 'published'
                                    ? 'bg-green-500 text-black font-semibold shadow-md'
                                    : 'bg-gray-700/50 hover:bg-gray-700/80 text-gray-300'
                            }`}
                        >
                            Published ({news.filter(n => n.status === 'published').length})
                        </button>
                        <button
                            onClick={() => setStatusFilter('draft')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                statusFilter === 'draft'
                                    ? 'bg-purple-500 text-white font-semibold shadow-md'
                                    : 'bg-gray-700/50 hover:bg-gray-700/80 text-gray-300'
                            }`}
                        >
                            Drafts ({news.filter(n => n.status === 'draft').length})
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    {loading ? (
                        <div className="text-center py-12">
                            <FaNewspaper className="w-12 h-12 text-gray-400 animate-pulse mx-auto mb-4" />
                            <p className="text-gray-400">Loading news articles...</p>
                        </div>
                    ) : news.filter(a => statusFilter === 'all' || a.status === statusFilter).length === 0 ? (
                        <div className="text-center py-12">
                            <FaNewspaper className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-400 font-medium mb-2">No news articles found in this filter</p>
                            <p className="text-gray-500 text-sm">
                                {statusFilter === 'pending' ? 'No pending submissions awaiting review.' : 'Create your first news article to get started'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {news
                                .filter(article => statusFilter === 'all' || article.status === statusFilter)
                                .map(article => (
                                <div key={article._id} className={`border rounded-xl p-5 transition-all duration-200 ${
                                    article.status === 'pending'
                                        ? 'bg-amber-950/20 border-amber-500/30 hover:bg-amber-950/30'
                                        : 'bg-gray-700/30 border-gray-600/30 hover:bg-gray-700/40'
                                }`}>
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                <h4 className="font-semibold text-white text-lg">{article.title}</h4>
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${
                                                    article.status === 'published'
                                                        ? 'bg-green-500/10 text-green-300 border border-green-500/20'
                                                        : article.status === 'pending'
                                                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                                                        : 'bg-yellow-500/10 text-yellow-300 border border-yellow-500/20'
                                                }`}>
                                                    {article.status === 'pending' ? '⏳ Pending Review' : article.status}
                                                </span>
                                                {article.type === 'pr' && (
                                                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                                        Press Release
                                                    </span>
                                                )}
                                                {article.featuredInBanner && (
                                                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                                                        ★ In Top Banner
                                                    </span>
                                                )}
                                            </div>

                                            <p className="text-gray-300 text-sm mb-3 line-clamp-2">{article.excerpt}</p>

                                            <div className="flex items-center gap-4 text-xs text-gray-400 flex-wrap mb-3">
                                                <div className="flex items-center gap-1">
                                                    <FaUser className="w-3 h-3 text-cyan-400" />
                                                    {article.author}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <FaClock className="w-3 h-3 text-cyan-400" />
                                                    {formatDate(article.publishedAt || article.createdAt)}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <FaEye className="w-3 h-3 text-cyan-400" />
                                                    {article.views || 0} views
                                                </div>
                                                {article.tags && article.tags.length > 0 && (
                                                    <div className="flex items-center gap-1">
                                                        <FaTags className="w-3 h-3 text-cyan-400" />
                                                        {article.tags.slice(0, 3).join(', ')}
                                                        {article.tags.length > 3 && '...'}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Payment & Submission Details Banner */}
                                            {(article.paymentMethod || article.amount || article.plan || article.email) && (
                                                <div className="p-3 bg-gray-900/80 border border-gray-700/60 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs mb-2">
                                                    <div className="flex flex-wrap items-center gap-2.5">
                                                        <span className="text-gray-400 font-medium">Payment:</span>
                                                        <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold uppercase">
                                                            {article.paymentMethod === 'paypal' ? '🅿️ PayPal' : article.paymentMethod || 'Paid'}
                                                        </span>
                                                        {article.amount && (
                                                            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                                                                ${article.amount} USD
                                                            </span>
                                                        )}
                                                        {article.plan && (
                                                            <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium">
                                                                Plan: {article.planName || article.plan.toUpperCase()}
                                                            </span>
                                                        )}
                                                        {article.email && (
                                                            <span className="text-gray-300">
                                                                ✉ {article.email}
                                                            </span>
                                                        )}
                                                        {(article.paymentId || article.txHash) && (
                                                            <span className="text-gray-400 font-mono">
                                                                ID: {article.txHash ? (
                                                                    <a
                                                                        href={article.txHash.length > 50 && !article.txHash.startsWith('0x') ? `https://solscan.io/tx/${article.txHash}` : `https://etherscan.io/tx/${article.txHash}`}
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                        className="text-cyan-400 underline hover:text-cyan-300"
                                                                    >
                                                                        {article.txHash.slice(0, 10)}... ↗
                                                                    </a>
                                                                ) : (
                                                                    article.paymentId
                                                                )}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {article.status === 'pending' && (
                                                        <button
                                                            onClick={() => handleApproveNews(article)}
                                                            disabled={approvingId === article._id}
                                                            className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 disabled:opacity-50 text-white font-bold rounded-lg shadow-md flex items-center gap-1.5 transition-all"
                                                        >
                                                            {approvingId === article._id ? (
                                                                <>
                                                                    <FaSpinner className="w-3.5 h-3.5 animate-spin" />
                                                                    Publishing...
                                                                </>
                                                            ) : (
                                                                <>✓ Approve & Publish Live</>
                                                            )}
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-2 ml-2">
                                            {article.status === 'pending' && (
                                                <button
                                                    onClick={() => handleApproveNews(article)}
                                                    disabled={approvingId === article._id}
                                                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-all duration-200 flex items-center gap-1 shadow-sm whitespace-nowrap"
                                                    title="Approve and make live on NYALTX News Hub"
                                                >
                                                    ✓ Approve
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleToggleBanner(article)}
                                                className={`p-2 rounded-lg transition-all duration-200 border text-xs font-bold whitespace-nowrap ${
                                                    article.featuredInBanner
                                                        ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/30'
                                                        : 'bg-gray-700/50 hover:bg-gray-700/70 text-gray-400 border-gray-600/30'
                                                }`}
                                                title={article.featuredInBanner ? "Remove from top banner slider" : "Add to top banner slider"}
                                            >
                                                ★ {article.featuredInBanner ? 'In Banner' : 'Pin to Banner'}
                                            </button>
                                            {article.status === 'published' && (
                                                <button
                                                    onClick={() => window.open(`/news/${article.slug}`, '_blank')}
                                                    className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 rounded-lg transition-all duration-200"
                                                    title="View live article"
                                                >
                                                    <FaEye className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleEditNews(article)}
                                                className="p-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/30 rounded-lg transition-all duration-200"
                                                title="Edit article"
                                            >
                                                <FaEdit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteNews(article._id)}
                                                className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 rounded-lg transition-all duration-200"
                                                title="Delete article"
                                            >
                                                <FaTrash className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function CorporateNewsManagementPage() {
    return <AdminCorporateNewsClient />;
}
