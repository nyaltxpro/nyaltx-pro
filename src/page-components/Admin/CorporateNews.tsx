'use client';

import dynamic from 'next/dynamic';
import type QuillType from 'quill';
import type { QuillOptions } from 'quill';
import 'quill/dist/quill.snow.css';
import React, { useEffect, useRef, useState } from 'react';
import { Drawer } from '@/components/reui/drawer';
import { Alert } from '@/components/reui/alert';
import { Button } from '@/components/reui/button';
import { Combobox } from '@/components/reui/combobox';
import { Field } from '@/components/reui/field';
import { FileUpload } from '@/components/reui/file-upload';
import { Filters } from '@/components/reui/filters';
import { Spinner } from '@/components/reui/spinner';
import { useConfirmDialog } from '@/components/reui/confirm-dialog';
import { Eye, Grid2X2, LayoutList, Newspaper, Pencil, Plus, Trash2, Upload, X } from 'lucide-react';
import { Item } from '@/components/reui/item';
import { Switch } from '@/components/reui/switch';
import { TimePicker } from '@/components/reui/time-picker';
import { toReliableIpfsUrl } from '@/utils/ipfsUpload';

const AdminCorporateNewsClient = dynamic(() => Promise.resolve(AdminCorporateNewsComponent), {
    ssr: false,
    loading: () => (
        <div className="text-center py-12">
            <Newspaper className="mx-auto mb-4 h-10 w-10 animate-pulse text-gray-400" aria-hidden="true" />
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
    paymentSource?: string;
    email?: string;
    isPaid?: boolean;
    paymentVerified?: boolean;
}

const isPaidNewsSubmission = (article: NewsArticle) =>
    Boolean(
        article.isPaid ||
        article.paymentVerified ||
        article.paymentMethod ||
        article.paymentId ||
        article.txHash ||
        article.plan ||
        article.amount
    );

function AdminCorporateNewsComponent() {
    const { confirm, dialog: confirmationDialog } = useConfirmDialog();
    const [news, setNews] = useState<NewsArticle[]>([]);
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'published' | 'draft'>('all');
    const [submissionFilter, setSubmissionFilter] = useState<'all' | 'paid' | 'corporate'>('all');
    const [newsSearch, setNewsSearch] = useState('');
    const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;
    const [publishTime, setPublishTime] = useState('09:00');
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

    useEffect(() => {
        setCurrentPage(1);
    }, [newsSearch, statusFilter, submissionFilter]);

    const loadNews = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/news?status=all&limit=500');
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
            content: article.content || '',
            excerpt: article.excerpt || '',
            featuredImage: article.featuredImage || '',
            status: article.status,
            featuredInBanner: Boolean(article.featuredInBanner),
            tags: Array.isArray(article.tags) ? article.tags.join(', ') : '',
            author: article.author || 'Community Submission',
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
            const isPaidSubmission = isPaidNewsSubmission(article);
            const shouldBeInBanner = article.plan === 'slider' || article.plan === 'prem' || Boolean(article.featuredInBanner);
            const response = await fetch('/api/admin/news', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: article._id,
                    status: 'published',
                    publishedAt: new Date().toISOString(),
                    featuredInBanner: shouldBeInBanner,
                    isPaid: isPaidSubmission,
                    isPendingReview: false
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
            const [publishHours = '9', publishMinutes = '0'] = publishTime.split(':');
            const publishedAt = newsForm.status === 'published'
                ? new Date(
                    new Date().getFullYear(),
                    new Date().getMonth(),
                    new Date().getDate(),
                    Number(publishHours),
                    Number(publishMinutes)
                ).toISOString()
                : null;

            const newsData = {
                ...newsForm,
                tags: tagsArray,
                publishedAt
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
        if (!(await confirm({
            title: 'Delete news article?',
            description: 'This article will be permanently deleted.',
            confirmLabel: 'Delete article',
            destructive: true,
        }))) return;

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
    const handleFileSelect = (files: File[]) => {
        const file = files[0];
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
            featuredInBanner: false,
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

    const newsByType = news.filter(article => {
        if (submissionFilter === 'paid') return isPaidNewsSubmission(article);
        if (submissionFilter === 'corporate') return !isPaidNewsSubmission(article);
        return true;
    });
    const visibleNews = newsByType.filter(article => {
        if (statusFilter !== 'all' && article.status !== statusFilter) return false;
        const query = newsSearch.trim().toLowerCase();
        if (!query) return true;
        return [article.title, article.author, article.excerpt, ...(article.tags ?? [])]
            .join(' ')
            .toLowerCase()
            .includes(query);
    });
    const totalPages = Math.max(1, Math.ceil(visibleNews.length / pageSize));
    const pagedNews = visibleNews.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    const paidNewsCount = news.filter(isPaidNewsSubmission).length;

    return (
        <div className="space-y-6">
            {confirmationDialog}
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <div>
                            <h1 className="text-2xl font-semibold text-white" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                News Management
                            </h1>
                            <p className="mt-1 text-sm text-gray-400">Review submissions and publish corporate updates.</p>
                        </div>
                    </div>
                    <p className="text-gray-400 text-sm mt-1" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                        Review paid submissions and manage corporate announcements separately
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={handleCreateNews}
                        style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                    >
                        <Plus className="h-4 w-4" aria-hidden="true" />
                        Create News Article
                    </Button>
                </div>
            </div>

            {/* Status Messages */}
            {error && <Alert variant="destructive">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            <div className="flex flex-wrap items-center gap-2">
                <span className="mr-2 text-sm text-gray-400">News type:</span>
                {([
                    ['all', 'All News', news.length],
                    ['paid', 'Paid Submissions', paidNewsCount],
                    ['corporate', 'Corporate News', news.length - paidNewsCount],
                ] as const).map(([filter, label, count]) => (
                    <Button
                        key={filter}
                        size="sm"
                        variant={submissionFilter === filter ? 'secondary' : 'ghost'}
                        onClick={() => setSubmissionFilter(filter)}
                    >
                        {label} ({count})
                    </Button>
                ))}
            </div>

            {/* Create/Edit Form */}
            <Drawer
                open={isCreating}
                onClose={handleCancel}
                title={editingNews ? 'Edit News Article' : 'Create News Article'}
                maxWidth="max-w-4xl"
            >
                <div className="admin-panel-form flex h-full max-h-screen w-full flex-col overflow-y-auto border-l border-white/10 bg-[#0d0d0d] p-6">
                    <div className="mb-5 flex items-center justify-between gap-4 border-b border-white/10 pb-4">
                        <h2 className="font-semibold text-white flex items-center gap-2" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                            <Newspaper className="h-5 w-5 text-slate-300" aria-hidden="true" />
                            {editingNews ? 'Edit News Article' : 'Create News Article'}
                        </h2>
                        <Button
                            variant="ghost"
                            size="icon"
                            type="button"
                            onClick={handleCancel}
                            aria-label="Close news editor"
                        >
                            <X size={20} aria-hidden="true" />
                        </Button>
                    </div>

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
                                            <Spinner className="w-8 h-8 text-cyan-400 mx-auto mb-4" />
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
                                    <FileUpload
                                        id="ipfs-file-input"
                                        accept="image/jpeg,image/png,image/gif,image/webp"
                                        onFilesSelected={handleFileSelect}
                                        disabled={isUploadingToIPFS}
                                        label="Choose featured image"
                                        description="JPEG, PNG, GIF or WebP, up to 10 MB."
                                        className="flex-1"
                                    />
                                    {selectedFile && (
                                        <span className="text-sm text-gray-400 flex-1 truncate">
                                            {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                                        </span>
                                    )}

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        type="button"
                                        onClick={uploadToIPFS}
                                        disabled={!selectedFile || isUploadingToIPFS}
                                    >
                                        {isUploadingToIPFS ? (
                                            <>
                                                <Spinner className="w-4 h-4" />
                                                Uploading...
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="w-4 h-4" />
                                                Upload to IPFS
                                            </>
                                        )}
                                    </Button>
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
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            type="button"
                                            onClick={() => {
                                                const fixedUrl = toReliableIpfsUrl(newsForm.featuredImage);
                                                setNewsForm(prev => ({ ...prev, featuredImage: fixedUrl }));
                                                setSuccess('URL converted to working IPFS gateway!');
                                            }}
                                            title="Convert Pinata gateway URL to working IPFS.io gateway"
                                        >
                                            Fix URL
                                        </Button>
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
                            <Field id="news-status" label="Status">
                                <Combobox
                                    id="news-status"
                                    value={newsForm.status}
                                    options={[
                                        { value: 'draft', label: 'Draft' },
                                        { value: 'published', label: 'Published' },
                                        { value: 'pending', label: 'Pending Review' },
                                    ]}
                                    onValueChange={(value) => setNewsForm(prev => ({ ...prev, status: value as 'published' | 'draft' | 'pending' }))}
                                    placeholder="Select status"
                                    className="w-full rounded-lg border border-gray-600/50 bg-gray-700/50 px-3 py-2 text-white focus:border-blue-500/50"
                                />
                            </Field>
                            {newsForm.status === 'published' && (
                                <Field id="publish-time" label="Publish time" className="mt-3">
                                    <TimePicker
                                        id="publish-time"
                                        value={publishTime}
                                        onChange={(event) => setPublishTime(event.target.value)}
                                        aria-label="Publish time"
                                    />
                                </Field>
                            )}
                            <div className="mt-3 flex items-center gap-3">
                                <Switch
                                    checked={newsForm.featuredInBanner}
                                    onCheckedChange={(checked) => setNewsForm(prev => ({ ...prev, featuredInBanner: checked }))}
                                    aria-label="Feature in top banner slider"
                                />
                                <span className="text-xs font-medium text-yellow-300">Feature in Top Banner Slider</span>
                            </div>
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

                    <div className="flex gap-3 border-t border-white/10 pt-4">
                        <Button
                            variant="outline"
                            onClick={handleCancel}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="default"
                            onClick={handleSaveNews}
                            disabled={!newsForm.title || !newsForm.content}
                        >
                            {editingNews ? 'Update Article' : 'Create Article'}
                        </Button>
                    </div>
                </div>
            </Drawer>

            {/* News List */}
            <div className="admin-panel-card overflow-hidden">
                <div className="p-6 border-b border-gray-700/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h3 className="font-semibold text-white flex items-center gap-2" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                        <Newspaper className="w-5 h-5 text-slate-300" />
                        {submissionFilter === 'paid'
                            ? 'Paid News Submissions'
                            : submissionFilter === 'corporate'
                                ? 'Corporate News'
                                : 'News Articles & Submissions'}
                        {newsByType.length > 0 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                                {newsByType.length}
                            </span>
                        )}
                    </h3>

                    {/* Status Filter Tabs */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setStatusFilter('all')}
                        >
                            All ({newsByType.length})
                        </Button>
                        <Button
                            size="sm"
                            variant={statusFilter === 'pending' ? 'secondary' : 'ghost'}
                            onClick={() => setStatusFilter('pending')}
                        >
                            <span>Pending Review</span>
                            <span className="rounded-full px-1.5 text-[10px]">
                                {newsByType.filter(n => n.status === 'pending').length}
                            </span>
                        </Button>
                        <Button
                            size="sm"
                            variant={statusFilter === 'published' ? 'secondary' : 'ghost'}
                            onClick={() => setStatusFilter('published')}
                        >
                            Published ({newsByType.filter(n => n.status === 'published').length})
                        </Button>
                        <Button
                            size="sm"
                            variant={statusFilter === 'draft' ? 'secondary' : 'ghost'}
                            onClick={() => setStatusFilter('draft')}
                        >
                            Drafts ({newsByType.filter(n => n.status === 'draft').length})
                        </Button>
                    </div>
                </div>

                <Filters className="border-b border-white/10 px-6 py-3">
                    <input
                        type="search"
                        value={newsSearch}
                        onChange={(event) => setNewsSearch(event.target.value)}
                        placeholder="Search articles"
                        className="h-9 w-48 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white placeholder:text-white/40 focus:border-cyan-500/60 focus:outline-none"
                    />
                    <div className="ml-auto flex items-center gap-1 rounded-lg border border-white/10 p-1">
                        <Button
                            size="icon"
                            variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                            type="button"
                            onClick={() => setViewMode('table')}
                            aria-label="Table view"
                        >
                            <LayoutList className="size-4" aria-hidden="true" />
                        </Button>
                        <Button
                            size="icon"
                            variant={viewMode === 'cards' ? 'secondary' : 'ghost'}
                            type="button"
                            onClick={() => setViewMode('cards')}
                            aria-label="Card view"
                        >
                            <Grid2X2 className="size-4" aria-hidden="true" />
                        </Button>
                    </div>
                </Filters>

                <div className="p-6">
                    {loading ? (
                        <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-6 text-white/70">
                            <Spinner className="h-4 w-4" />
                            Loading news articles...
                        </div>
                    ) : visibleNews.length === 0 ? (
                        <div className="text-center py-12">
                            <Newspaper className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-400 font-medium mb-2">No news articles found in this filter</p>
                            <p className="text-gray-500 text-sm">
                                {statusFilter === 'pending'
                                    ? 'No pending submissions awaiting review.'
                                    : submissionFilter === 'paid'
                                        ? 'No paid news submissions found in this filter.'
                                        : submissionFilter === 'corporate'
                                            ? 'No corporate news articles found in this filter.'
                                            : 'Create your first news article to get started'}
                            </p>
                        </div>
                    ) : (
                        viewMode === 'cards' ? (
                            <div className="grid gap-4 lg:grid-cols-2">
                                {pagedNews.map(article => (
                                    <Item
                                        key={article._id}
                                        leading={
                                            <Newspaper className="h-5 w-5 text-slate-300" aria-hidden="true" />
                                        }
                                        trailing={
                                            <Switch
                                                checked={Boolean(article.featuredInBanner)}
                                                onCheckedChange={() => handleToggleBanner(article)}
                                                aria-label={`${article.featuredInBanner ? 'Unpin' : 'Pin'} ${article.title}`}
                                            />
                                        }
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="truncate font-semibold text-white">{article.title}</p>
                                                <p className="mt-1 line-clamp-2 text-xs text-white/50">{article.excerpt || `By ${article.author}`}</p>
                                            </div>
                                        </div>
                                        <div className="mt-3 flex flex-wrap items-center gap-2">
                                            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                                article.status === 'published'
                                                    ? 'bg-green-500/20 text-green-200'
                                                    : article.status === 'pending'
                                                        ? 'bg-amber-500/20 text-amber-200'
                                                        : 'bg-purple-500/20 text-purple-200'
                                            }`}>
                                                {article.status === 'pending' ? 'Pending review' : article.status}
                                            </span>
                                            {isPaidNewsSubmission(article) && (
                                                <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-xs text-blue-200">
                                                    Paid submission
                                                </span>
                                            )}
                                            {article.featuredInBanner && (
                                                <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-xs text-cyan-200">
                                                    Top banner
                                                </span>
                                            )}
                                        </div>
                                        <div className="mt-3 flex items-center justify-between gap-3 border-t border-white/10 pt-3 text-xs text-white/50">
                                            <span>{formatDate(article.publishedAt || article.createdAt)}</span>
                                            <div className="flex gap-2">
                                                {article.status === 'pending' && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        type="button"
                                                        onClick={() => handleApproveNews(article)}
                                                        disabled={approvingId === article._id}
                                                    >
                                                        {approvingId === article._id ? 'Publishing...' : 'Approve'}
                                                    </Button>
                                                )}
                                                <Button size="icon" variant="ghost" type="button" onClick={() => handleEditNews(article)} aria-label={`Edit ${article.title}`}>
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button size="icon" variant="destructive" type="button" onClick={() => handleDeleteNews(article._id)} aria-label={`Delete ${article.title}`}>
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    </Item>
                                ))}
                            </div>
                        ) : (
                        <div className="overflow-x-auto rounded-lg border border-white/10">
                            <table className="w-full min-w-[900px] text-left text-sm">
                                <thead className="border-b border-white/10 bg-white/[0.03] text-xs uppercase tracking-wider text-white/50">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">Article</th>
                                        <th className="px-4 py-3 font-medium">Status</th>
                                        <th className="px-4 py-3 font-medium">Submission</th>
                                        <th className="px-4 py-3 font-medium">Published</th>
                                        <th className="px-4 py-3 text-right font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/10">
                                    {pagedNews.map(article => (
                                        <tr key={article._id} className="transition hover:bg-white/[0.025]">
                                            <td className="max-w-md px-4 py-4">
                                                <p className="font-semibold text-white">{article.title}</p>
                                                <p className="mt-1 line-clamp-1 text-xs text-white/50">
                                                    {article.excerpt || `By ${article.author}`}
                                                </p>
                                                {article.featuredInBanner && (
                                                    <span className="mt-2 inline-flex rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[11px] text-cyan-200">
                                                        In top banner
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                                    article.status === 'published'
                                                        ? 'bg-green-500/20 text-green-200'
                                                        : article.status === 'pending'
                                                            ? 'bg-amber-500/20 text-amber-200'
                                                            : 'bg-purple-500/20 text-purple-200'
                                                }`}>
                                                    {article.status === 'pending' ? 'Pending review' : article.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex flex-col gap-1 text-xs text-white/60">
                                                    {isPaidNewsSubmission(article) ? (
                                                        <>
                                                            <span className="text-blue-200">
                                                                {article.paymentSource === 'paypal_crypto'
                                                                    ? 'PayPal Crypto'
                                                                    : article.paymentMethod === 'paypal'
                                                                        ? 'PayPal'
                                                                        : 'Paid submission'}
                                                            </span>
                                                            {article.amount ? <span>${article.amount} USD</span> : null}
                                                            {article.email ? <span className="max-w-48 truncate">{article.email}</span> : null}
                                                        </>
                                                    ) : (
                                                        <span>{article.type === 'pr' ? 'Press release' : 'Corporate news'}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4 text-white/60">
                                                {formatDate(article.publishedAt || article.createdAt)}
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex justify-end gap-2">
                                                    {article.status === 'pending' && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleApproveNews(article)}
                                                            disabled={approvingId === article._id}
                                                        >
                                                            {approvingId === article._id ? <><Spinner className="h-3.5 w-3.5" /> Publishing</> : 'Approve'}
                                                        </Button>
                                                    )}
                                                    <Button
                                                        size="sm"
                                                        variant={article.featuredInBanner ? 'secondary' : 'outline'}
                                                        onClick={() => handleToggleBanner(article)}
                                                    >
                                                        {article.featuredInBanner ? 'Unpin' : 'Pin'}
                                                    </Button>
                                                    {article.status === 'published' && (
                                                        <Button
                                                            size="icon"
                                                            variant="outline"
                                                            onClick={() => window.open(`/news/${article.slug}`, '_blank')}
                                                            title="View live article"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    <Button
                                                        size="icon"
                                                        variant="outline"
                                                        onClick={() => handleEditNews(article)}
                                                        title="Edit article"
                                                        aria-label={`Edit ${article.title}`}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="destructive"
                                                        onClick={() => handleDeleteNews(article._id)}
                                                        title="Delete article"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        )
                    )}
                    {visibleNews.length > pageSize && (
                        <div className="mt-4 flex items-center justify-between gap-3">
                            <p className="text-xs text-white/50">
                                Page {currentPage} of {totalPages}
                            </p>
                            <div className="flex overflow-hidden rounded-md border border-white/10">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    type="button"
                                    onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                                    disabled={currentPage === 1}
                                    className="border-r border-white/10 px-3 py-2 text-sm text-white/70 disabled:opacity-40"
                                >
                                    Previous
                                </Button>
                                {Array.from({ length: totalPages }, (_, index) => index + 1).slice(
                                    Math.max(0, currentPage - 2),
                                    Math.max(3, currentPage + 1)
                                ).map(page => (
                                    <Button
                                        type="button"
                                        key={page}
                                        variant={currentPage === page ? 'secondary' : 'ghost'}
                                        size="sm"
                                        onClick={() => setCurrentPage(page)}
                                    >
                                        {page}
                                    </Button>
                                ))}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    type="button"
                                    onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                                    disabled={currentPage === totalPages}
                                    className="border-l border-white/10 px-3 py-2 text-sm text-white/70 disabled:opacity-40"
                                >
                                    Next
                                </Button>
                            </div>
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
