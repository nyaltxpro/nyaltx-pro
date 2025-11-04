'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import 'quill/dist/quill.snow.css';
import type QuillType from 'quill';
import type { QuillOptions } from 'quill';
import {
  FaEdit,
  FaNewspaper,
  FaPlus,
  FaSave,
  FaSpinner,
  FaTag,
  FaTrash,
  FaUpload,
} from 'react-icons/fa';
import type { SerializedBlogPost } from '@/lib/blogServer';

interface BlogFormState {
  id?: string;
  title: string;
  slug: string;
  author: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  readingTime: string;
  categories: string;
  tags: string;
  status: 'draft' | 'published';
  publishedAt: string;
  seoMetaTitle: string;
  seoMetaDescription: string;
  seoKeywords: string;
  seoOgImage: string;
}

interface FetchState {
  loading: boolean;
  error: string | null;
  success: string | null;
}

const initialFormState: BlogFormState = {
  title: '',
  slug: '',
  author: 'NYALTX Team',
  excerpt: '',
  content: '',
  featuredImage: '',
  readingTime: '',
  categories: '',
  tags: '',
  status: 'draft',
  publishedAt: '',
  seoMetaTitle: '',
  seoMetaDescription: '',
  seoKeywords: '',
  seoOgImage: '',
};

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

const AdminBlogManagerComponent = () => {
  const [posts, setPosts] = useState<SerializedBlogPost[]>([]);
  const [form, setForm] = useState<BlogFormState>(initialFormState);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [state, setState] = useState<FetchState>({ loading: false, error: null, success: null });
  const [isListLoading, setIsListLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [isUploadingToIPFS, setIsUploadingToIPFS] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const quillContainerRef = useRef<HTMLDivElement | null>(null);
  const quillInstanceRef = useRef<QuillType | null>(null);
  const quillChangeHandlerRef = useRef<((delta: unknown, oldDelta: unknown, source: string) => void) | null>(null);
  const suppressQuillChangeRef = useRef(false);

  useEffect(() => {
    const teardown = () => {
      const existing = quillInstanceRef.current;
      if (existing && quillChangeHandlerRef.current) {
        existing.off('text-change', quillChangeHandlerRef.current);
      }
      quillInstanceRef.current = null;
      quillChangeHandlerRef.current = null;
    };

    if (!isFormOpen) {
      teardown();
      return teardown;
    }

    let isCancelled = false;

    const initialize = async () => {
      const container = quillContainerRef.current;
      if (!container) return;
      if (quillInstanceRef.current) return;

      const { default: Quill } = await import('quill');
      if (isCancelled) return;

      const quill = new Quill(container, {
        theme: 'snow',
        modules: quillModules,
        formats: quillFormats,
      });

      quillInstanceRef.current = quill;

      if (!form.content) {
        suppressQuillChangeRef.current = true;
        quill.setText('');
        quill.history.clear();
        suppressQuillChangeRef.current = false;
      }

      const handler = (_delta: unknown, _oldDelta: unknown, source: string) => {
        if (suppressQuillChangeRef.current || source !== 'user') return;
        const html = normalizeQuillHtml(quill.root.innerHTML);
        setForm((prev) => (prev.content === html ? prev : { ...prev, content: html }));
      };

      quillChangeHandlerRef.current = handler;
      quill.on('text-change', handler);

      suppressQuillChangeRef.current = true;
      quill.clipboard.dangerouslyPasteHTML(form.content || '');
      quill.history.clear();
      suppressQuillChangeRef.current = false;
    };

    void initialize();

    return () => {
      isCancelled = true;
      teardown();
    };
  }, [isFormOpen]);

  useEffect(() => {
    if (!isFormOpen) return;
    const quill = quillInstanceRef.current;
    if (!quill) return;

    const desired = normalizeQuillHtml(form.content);
    const current = normalizeQuillHtml(quill.root.innerHTML);

    if (desired === current) return;

    suppressQuillChangeRef.current = true;
    quill.clipboard.dangerouslyPasteHTML(desired);
    quill.history.clear();
    suppressQuillChangeRef.current = false;
  }, [form.content, isFormOpen]);

  const loadPosts = async (status: 'all' | 'published' | 'draft' = 'all') => {
    try {
      setIsListLoading(true);
      const params = new URLSearchParams({ status, limit: '100' });
      const response = await fetch(`/api/admin/blog?${params.toString()}`, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch blog posts');
      }
      const data = await response.json();
      setPosts(data.posts ?? []);
    } catch (error) {
      console.error(error);
      setState((prev) => ({ ...prev, error: 'Failed to load blog posts' }));
    } finally {
      setIsListLoading(false);
    }
  };

  useEffect(() => {
    loadPosts(activeFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilter]);

  const resetForm = () => {
    setForm(initialFormState);
    setIsFormOpen(false);
    setSelectedFile(null);
    setIsUploadingToIPFS(false);
  };

  const handleCreate = () => {
    setForm(initialFormState);
    setIsFormOpen(true);
    setState({ loading: false, error: null, success: null });
  };

  const handleEdit = (post: SerializedBlogPost) => {
    const contentString = (() => {
      if (typeof post.content === 'string') return post.content;
      if (!post.content) return '';
      try {
        return JSON.stringify(post.content);
      } catch (error) {
        console.warn('Failed to stringify blog content', error);
        return '';
      }
    })();

    setForm({
      id: post._id,
      title: post.title ?? '',
      slug: post.slug ?? '',
      author: post.author ?? 'NYALTX Team',
      excerpt: post.excerpt ?? '',
      content: contentString,
      featuredImage: post.featuredImage ?? '',
      readingTime: post.readingTime ?? '',
      categories: (post.categories ?? []).join(', '),
      tags: (post.tags ?? []).join(', '),
      status: post.status ?? 'draft',
      publishedAt: post.publishedAt ?? '',
      seoMetaTitle: post.seo?.metaTitle ?? '',
      seoMetaDescription: post.seo?.metaDescription ?? '',
      seoKeywords: post.seo?.keywords ?? '',
      seoOgImage: post.seo?.ogImage ?? '',
    });
    setIsFormOpen(true);
    setState({ loading: false, error: null, success: null });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;
    try {
      setState({ loading: true, error: null, success: null });
      const response = await fetch('/api/admin/blog', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to delete blog post');
      }
      setState({ loading: false, error: null, success: 'Blog post deleted successfully' });
      loadPosts(activeFilter);
    } catch (error: any) {
      setState({ loading: false, error: error.message ?? 'Failed to delete blog post', success: null });
    }
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      setState({ loading: false, error: 'Title and content are required', success: null });
      return;
    }

    const payload: Record<string, any> = {
      title: form.title.trim(),
      slug: form.slug.trim() || undefined,
      author: form.author.trim(),
      excerpt: form.excerpt.trim(),
      content: form.content,
      featuredImage: form.featuredImage.trim(),
      readingTime: form.readingTime.trim(),
      categories: form.categories,
      tags: form.tags,
      status: form.status,
      publishedAt: form.publishedAt || undefined,
      seo: {
        metaTitle: form.seoMetaTitle.trim(),
        metaDescription: form.seoMetaDescription.trim(),
        keywords: form.seoKeywords.trim(),
        ogImage: form.seoOgImage.trim(),
      },
    };

    // Remove empty seo fields
    if (!payload.seo.metaTitle && !payload.seo.metaDescription && !payload.seo.keywords && !payload.seo.ogImage) {
      delete payload.seo;
    }

    if (!payload.featuredImage) delete payload.featuredImage;
    if (!payload.readingTime) delete payload.readingTime;

    try {
      setState({ loading: true, error: null, success: null });
      const response = await fetch('/api/admin/blog', {
        method: form.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...payload, ...(form.id ? { id: form.id } : {}) }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save blog post');
      }
      setState({ loading: false, error: null, success: form.id ? 'Blog post updated successfully' : 'Blog post created successfully' });
      resetForm();
      loadPosts(activeFilter);
    } catch (error: any) {
      setState({ loading: false, error: error.message ?? 'Failed to save blog post', success: null });
    }
  };

  const filteredPosts = useMemo(() => {
    if (activeFilter === 'all') return posts;
    return posts.filter((post) => post.status === activeFilter);
  }, [posts, activeFilter]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length) {
      setSelectedFile(null);
      return;
    }

    const file = event.target.files[0];
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setSelectedFile(null);
      setState((prev) => ({ ...prev, error: 'Please choose a JPEG, PNG, GIF, or WebP image for the featured image.', success: null }));
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setSelectedFile(null);
      setState((prev) => ({ ...prev, error: 'Image must be 10MB or smaller.', success: null }));
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      if (image.width < 400 || image.height < 200) {
        setSelectedFile(null);
        setState((prev) => ({ ...prev, error: 'Image dimensions must be at least 400x200 pixels.', success: null }));
        const element = document.getElementById('blog-ipfs-file') as HTMLInputElement | null;
        if (element) element.value = '';
        return;
      }

      setSelectedFile(file);
      setState((prev) => ({ ...prev, error: null }));
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setSelectedFile(null);
      setState((prev) => ({ ...prev, error: 'Unable to read image file. Please try another.', success: null }));
      const element = document.getElementById('blog-ipfs-file') as HTMLInputElement | null;
      if (element) element.value = '';
    };
    image.src = objectUrl;
  };

  const uploadToIPFS = async () => {
    if (!selectedFile) {
      setState((prev) => ({ ...prev, error: 'Select an image before uploading.', success: null }));
      return;
    }

    try {
      setIsUploadingToIPFS(true);
      setState((prev) => ({ ...prev, error: null, success: null }));

      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/upload/ipfs', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to upload image to IPFS');
      }

      const data = await response.json();
      const ipfsUrl = `https://ipfs.io/ipfs/${data.hash}`;
      setForm((prev) => ({ ...prev, featuredImage: ipfsUrl }));
      setSelectedFile(null);
      const element = document.getElementById('blog-ipfs-file') as HTMLInputElement | null;
      if (element) element.value = '';

      setState((prev) => ({ ...prev, success: 'Image uploaded to IPFS successfully.', error: null }));
    } catch (error: any) {
      setState((prev) => ({ ...prev, error: error.message ?? 'Failed to upload image to IPFS', success: null }));
    } finally {
      setIsUploadingToIPFS(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-white">Blog Management</h2>
          <p className="text-sm text-white/60">Create, publish, and maintain NYALTX blog posts.</p>
        </div>
        <button
          onClick={handleCreate}
          className="inline-flex items-center gap-2 rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-200 transition hover:bg-cyan-500/20"
        >
          <FaPlus className="h-4 w-4" />
          New Blog Post
        </button>
      </div>

      {state.error ? (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {state.error}
        </div>
      ) : null}
      {state.success ? (
        <div className="rounded-lg border border-green-500/40 bg-green-500/10 px-4 py-3 text-sm text-green-200">
          {state.success}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        {(['all', 'published', 'draft'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-widest transition ${
              activeFilter === filter
                ? 'border-cyan-500/60 bg-cyan-500/20 text-cyan-100'
                : 'border-white/10 bg-white/5 text-white/50 hover:border-cyan-500/40 hover:text-cyan-100'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="grid gap-4">
        {isListLoading ? (
          <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-6 text-white/70">
            <FaSpinner className="h-4 w-4 animate-spin" /> Loading posts...
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-10 text-center text-white/60">
            No blog posts yet.
          </div>
        ) : (
          filteredPosts.map((post) => (
            <div key={post._id} className="rounded-xl border border-white/10 bg-white/5 p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-widest">
                    <span
                      className={`rounded-full px-3 py-1 ${
                        post.status === 'published'
                          ? 'bg-green-500/20 text-green-200'
                          : 'bg-yellow-500/20 text-yellow-200'
                      }`}
                    >
                      {post.status}
                    </span>
                    {post.publishedAt ? <span className="text-white/60">{new Date(post.publishedAt).toLocaleString()}</span> : null}
                  </div>
                  <h3 className="text-xl font-semibold text-white">{post.title}</h3>
                  <p className="text-sm text-white/70">{post.excerpt}</p>
                  {post.tags?.length ? (
                    <div className="flex flex-wrap items-center gap-2 text-xs text-white/60">
                      <FaTag className="h-3 w-3" />
                      {post.tags.map((tag) => (
                        <span key={tag} className="rounded-full border border-white/10 px-2 py-0.5">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="flex items-center gap-2 self-end">
                  <button
                    onClick={() => handleEdit(post)}
                    className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs font-medium text-white/80 transition hover:border-cyan-500/40 hover:text-cyan-100"
                  >
                    <FaEdit className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(post._id)}
                    className="inline-flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-200 transition hover:bg-red-500/20"
                  >
                    <FaTrash className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isFormOpen ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
              <FaNewspaper className="h-5 w-5 text-cyan-300" />
              {form.id ? 'Edit Blog Post' : 'Create Blog Post'}
            </h3>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <label className="block text-sm text-white/70">
                Title
                <input
                  type="text"
                  value={form.title}
                  onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white focus:border-cyan-500/60 focus:outline-none"
                />
              </label>
              <label className="block text-sm text-white/70">
                Slug (optional)
                <input
                  type="text"
                  value={form.slug}
                  onChange={(event) => setForm((prev) => ({ ...prev, slug: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white focus:border-cyan-500/60 focus:outline-none"
                  placeholder="auto-generated from title"
                />
              </label>
              <label className="block text-sm text-white/70">
                Author
                <input
                  type="text"
                  value={form.author}
                  onChange={(event) => setForm((prev) => ({ ...prev, author: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white focus:border-cyan-500/60 focus:outline-none"
                />
              </label>
              <label className="block text-sm text-white/70">
                Featured Image URL
                <input
                  type="text"
                  value={form.featuredImage}
                  onChange={(event) => setForm((prev) => ({ ...prev, featuredImage: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white focus:border-cyan-500/60 focus:outline-none"
                  placeholder="https://ipfs.io/ipfs/..."
                />
              </label>
              <div className="rounded-lg border border-white/10 bg-black/20 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/40">Upload to IPFS</p>
                <p className="mt-2 text-sm text-white/60">
                  Select an image to upload via the existing IPFS uploader. When the upload finishes, the image URL will be added automatically.
                </p>
                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <input
                    id="blog-ipfs-file"
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleFileSelect}
                    className="text-sm text-white/70 file:mr-3 file:rounded-md file:border-0 file:bg-cyan-500/20 file:px-3 file:py-2 file:text-sm file:font-medium file:text-cyan-100 hover:file:bg-cyan-500/30"
                  />
                  <button
                    type="button"
                    onClick={uploadToIPFS}
                    disabled={isUploadingToIPFS || !selectedFile}
                    className="inline-flex items-center gap-2 rounded-lg border border-cyan-500/40 bg-cyan-500/20 px-3 py-2 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-500/30 disabled:opacity-60"
                  >
                    {isUploadingToIPFS ? <FaSpinner className="h-4 w-4 animate-spin" /> : <FaUpload className="h-4 w-4" />}
                    Upload to IPFS
                  </button>
                </div>
                {selectedFile ? (
                  <p className="mt-2 text-xs text-white/50">
                    Selected file: <span className="font-medium text-white">{selectedFile.name}</span>
                  </p>
                ) : null}
                {form.featuredImage ? (
                  <p className="mt-2 text-xs text-white/50 break-all">
                    Current image: <span className="font-medium text-white/80">{form.featuredImage}</span>
                  </p>
                ) : null}
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-sm text-white/70">
                Status
                <select
                  value={form.status}
                  onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value as 'draft' | 'published' }))}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white focus:border-cyan-500/60 focus:outline-none"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </label>
              <label className="block text-sm text-white/70">
                Published At (optional)
                <input
                  type="datetime-local"
                  value={form.publishedAt}
                  onChange={(event) => setForm((prev) => ({ ...prev, publishedAt: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white focus:border-cyan-500/60 focus:outline-none"
                />
              </label>
              <label className="block text-sm text-white/70">
                Reading Time Label
                <input
                  type="text"
                  value={form.readingTime}
                  onChange={(event) => setForm((prev) => ({ ...prev, readingTime: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white focus:border-cyan-500/60 focus:outline-none"
                  placeholder="e.g. 5 min read"
                />
              </label>
              <label className="block text-sm text-white/70">
                Categories (comma separated)
                <input
                  type="text"
                  value={form.categories}
                  onChange={(event) => setForm((prev) => ({ ...prev, categories: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white focus:border-cyan-500/60 focus:outline-none"
                />
              </label>
              <label className="block text-sm text-white/70">
                Tags (comma separated)
                <input
                  type="text"
                  value={form.tags}
                  onChange={(event) => setForm((prev) => ({ ...prev, tags: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white focus:border-cyan-500/60 focus:outline-none"
                />
              </label>
            </div>
          </div>

          <label className="mt-4 block text-sm text-white/70">
            Excerpt
            <textarea
              value={form.excerpt}
              onChange={(event) => setForm((prev) => ({ ...prev, excerpt: event.target.value }))}
              rows={3}
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white focus:border-cyan-500/60 focus:outline-none"
              placeholder="Short description shown on listing pages"
            />
          </label>

          <label className="mt-4 block text-sm text-white/70">
            Content
            <div className="mt-2 rounded-lg border border-white/10 bg-black/10">
              <div
                ref={quillContainerRef}
                className="quill-editor"
                style={{ minHeight: '320px' }}
              />
            </div>
          </label>

          <div className="mt-6 rounded-xl border border-white/10 bg-black/20 p-4">
            <h4 className="text-sm font-semibold text-white">SEO Metadata</h4>
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              <label className="block text-sm text-white/70">
                Meta Title
                <input
                  type="text"
                  value={form.seoMetaTitle}
                  onChange={(event) => setForm((prev) => ({ ...prev, seoMetaTitle: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white focus:border-cyan-500/60 focus:outline-none"
                />
              </label>
              <label className="block text-sm text-white/70">
                Meta Description
                <input
                  type="text"
                  value={form.seoMetaDescription}
                  onChange={(event) => setForm((prev) => ({ ...prev, seoMetaDescription: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white focus:border-cyan-500/60 focus:outline-none"
                />
              </label>
              <label className="block text-sm text-white/70">
                Keywords (comma separated)
                <input
                  type="text"
                  value={form.seoKeywords}
                  onChange={(event) => setForm((prev) => ({ ...prev, seoKeywords: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white focus:border-cyan-500/60 focus:outline-none"
                />
              </label>
              <label className="block text-sm text-white/70">
                Open Graph Image URL
                <input
                  type="text"
                  value={form.seoOgImage}
                  onChange={(event) => setForm((prev) => ({ ...prev, seoOgImage: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white focus:border-cyan-500/60 focus:outline-none"
                />
              </label>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={handleSave}
              disabled={state.loading}
              className="inline-flex items-center gap-2 rounded-lg border border-cyan-500/40 bg-cyan-500/20 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-500/30 disabled:opacity-60"
            >
              {state.loading ? <FaSpinner className="h-4 w-4 animate-spin" /> : <FaSave className="h-4 w-4" />}
              {form.id ? 'Update Post' : 'Create Post'}
            </button>
            <button
              onClick={resetForm}
              className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white/70 transition hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AdminBlogManagerComponent;
