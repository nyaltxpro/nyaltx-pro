'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import type QuillType from 'quill';
import type { QuillOptions } from 'quill';
import 'quill/dist/quill.snow.css';
import React, { useEffect, useRef, useState } from 'react';
import { FaClock, FaEdit, FaEye, FaNewspaper, FaPlus, FaSpinner, FaTags, FaTrash, FaUpload, FaUser } from 'react-icons/fa';

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
    status: 'published' | 'draft';
    publishedAt?: Date;
    tags: string[];
    author: string;
    slug: string;
    createdAt: Date;
    updatedAt: Date;
    views: number;
}

function AdminCorporateNewsComponent() {
    const [news, setNews] = useState<NewsArticle[]>([]);
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
        status: 'draft' as 'published' | 'draft',
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

    // Helper function to convert Pinata gateway URLs to ipfs.io
    const convertToWorkingIPFSUrl = (url: string): string => {
        if (url.includes('gateway.pinata.cloud/ipfs/')) {
            const hash = url.split('gateway.pinata.cloud/ipfs/')[1];
            return `https://ipfs.io/ipfs/${hash}`;
        }
        return url;
    };

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
            tags: article.tags.join(', '),
            author: article.author,
            editorType: 'quill' // Default to quill for existing articles
        });
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
            const ipfsUrl = `https://ipfs.io/ipfs/${data.hash}`;

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
                            <div className="relative rounded-lg border border-gray-600/50 bg-gray-700/30">
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
                                onChange={(e) => setNewsForm(prev => ({ ...prev, status: e.target.value as 'published' | 'draft' }))}
                                className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:border-blue-500/50"
                            >
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                            </select>
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
                <div className="p-6 border-b border-gray-700/20">
                    <h3 className="font-semibold text-white flex items-center gap-2" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                        <FaNewspaper className="w-5 h-5 text-cyan-400" />
                        News Articles
                        {news.length > 0 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                                {news.length}
                            </span>
                        )}
                    </h3>
                </div>

                <div className="p-6">
                    {loading ? (
                        <div className="text-center py-12">
                            <FaNewspaper className="w-12 h-12 text-gray-400 animate-pulse mx-auto mb-4" />
                            <p className="text-gray-400">Loading news articles...</p>
                        </div>
                    ) : news.length === 0 ? (
                        <div className="text-center py-12">
                            <FaNewspaper className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-400 font-medium mb-2">No news articles found</p>
                            <p className="text-gray-500 text-sm">Create your first news article to get started</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {news.map(article => (
                                <div key={article._id} className="bg-gray-700/30 border border-gray-600/30 rounded-lg p-4 hover:bg-gray-700/40 transition-all duration-200">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h4 className="font-medium text-white text-lg">{article.title}</h4>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${article.status === 'published'
                                                    ? 'bg-green-500/10 text-green-300 border border-green-500/20'
                                                    : 'bg-yellow-500/10 text-yellow-300 border border-yellow-500/20'
                                                    }`}>
                                                    {article.status}
                                                </span>
                                            </div>

                                            <p className="text-gray-400 text-sm mb-3 line-clamp-2">{article.excerpt}</p>

                                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    <FaUser className="w-3 h-3" />
                                                    {article.author}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <FaClock className="w-3 h-3" />
                                                    {formatDate(article.publishedAt || article.createdAt)}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <FaEye className="w-3 h-3" />
                                                    {article.views} views
                                                </div>
                                                {article.tags.length > 0 && (
                                                    <div className="flex items-center gap-1">
                                                        <FaTags className="w-3 h-3" />
                                                        {article.tags.slice(0, 2).join(', ')}
                                                        {article.tags.length > 2 && '...'}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex gap-2 ml-4">
                                            {article.status === 'published' && (
                                                <button
                                                    onClick={() => window.open(`/news/${article.slug}`, '_blank')}
                                                    className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 rounded-lg transition-all duration-200"
                                                    title="View article"
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
