'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Drawer } from '@/components/reui/drawer';
import { CalendarInput } from '@/components/reui/calendar';
import 'quill/dist/quill.snow.css';
import type QuillType from 'quill';
import type { QuillOptions } from 'quill';
import { MoreHorizontal, Newspaper, Pencil, Plus, Save, Trash2, Upload, X } from 'lucide-react';
import type { SerializedBlogPost } from '@/lib/blogServer';
import { Button } from '@/components/reui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/reui/dropdown-menu';
import { EventCalendar } from '@/components/reui/event-calendar';
import { Field } from '@/components/reui/field';
import { FileType } from '@/components/reui/file-type';
import { FileUpload } from '@/components/reui/file-upload';
import { Filters } from '@/components/reui/filters';
import { Combobox } from '@/components/reui/combobox';
import { Checkbox } from '@/components/reui/checkbox';
import { Spinner } from '@/components/reui/spinner';

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
  editorType: 'simple' | 'quill';
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
  editorType: 'quill',
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
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredOnly, setFeaturedOnly] = useState(false);
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

    if (!isFormOpen || form.editorType !== 'quill') {
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
  }, [isFormOpen, form.editorType]);

  useEffect(() => {
    if (!isFormOpen || form.editorType !== 'quill') return;
    const quill = quillInstanceRef.current;
    if (!quill) return;

    const desired = normalizeQuillHtml(form.content);
    const current = normalizeQuillHtml(quill.root.innerHTML);

    if (desired === current) return;

    suppressQuillChangeRef.current = true;
    quill.clipboard.dangerouslyPasteHTML(desired);
    quill.history.clear();
    suppressQuillChangeRef.current = false;
  }, [form.content, isFormOpen, form.editorType]);

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

  const resetForm = () => {
    setForm(initialFormState);
    setIsFormOpen(false);
    setSelectedFile(null);
    setIsUploadingToIPFS(false);
  };

  useEffect(() => {
    loadPosts(activeFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilter]);

  useEffect(() => {
    if (!isFormOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !state.loading && !isUploadingToIPFS) {
        resetForm();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isFormOpen, state.loading, isUploadingToIPFS]);

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
      editorType: 'quill', // Default to quill for existing posts
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
    const query = searchQuery.trim().toLowerCase();
    return posts.filter((post) => {
      if (activeFilter !== 'all' && post.status !== activeFilter) return false;
      if (featuredOnly && !post.featuredImage) return false;
      if (!query) return true;
      return [post.title, post.author, post.excerpt, ...(post.tags ?? [])]
        .join(' ')
        .toLowerCase()
        .includes(query);
    });
  }, [posts, activeFilter, searchQuery, featuredOnly]);

  const scheduledEvents = useMemo(() => posts.flatMap(post => {
    if (!post.publishedAt) return [];
    const startsAt = new Date(post.publishedAt);
    if (!Number.isFinite(startsAt.getTime())) return [];
    return [{
      id: post._id,
      title: post.title,
      startsAt: startsAt.toISOString(),
      status: post.status,
    }];
  }), [posts]);

  const handleFileSelect = (files: File[]) => {
    if (!files.length) {
      setSelectedFile(null);
      return;
    }

    const file = files[0];
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
      const ipfsUrl = data.url || `https://gateway.pinata.cloud/ipfs/${data.hash}`;
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
          <h1 className="text-2xl font-semibold text-white">Blog Management</h1>
          <p className="text-sm text-white/60">Create, publish, and maintain NYALTX blog posts.</p>
        </div>
        <Button
          variant="outline"
          size="default"
          type="button"
          onClick={handleCreate}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          New Blog Post
        </Button>
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

      <Filters className="mb-4">
        {(['all', 'published', 'draft'] as const).map((filter) => (
          <Button
            key={filter}
            variant={activeFilter === filter ? 'secondary' : 'ghost'}
            size="sm"
            type="button"
            onClick={() => setActiveFilter(filter)}
            className="uppercase tracking-widest"
          >
            {filter}
          </Button>
        ))}
        <div className="ml-auto flex flex-wrap items-center gap-3">
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search posts"
            className="h-9 w-48 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white placeholder:text-white/40 focus:border-cyan-500/60 focus:outline-none"
          />
          <label className="flex items-center gap-2 text-sm text-white/70">
            <Checkbox checked={featuredOnly} onChange={(event) => setFeaturedOnly(event.target.checked)} />
            Featured image
          </label>
        </div>
      </Filters>

      <EventCalendar
        title="Publishing calendar"
        events={scheduledEvents}
        onEventSelect={event => {
          const post = posts.find(item => item._id === event.id);
          if (post) handleEdit(post);
        }}
      />

      <div className="grid gap-4">
        {isListLoading ? (
          <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-6 text-white/70">
            <Spinner className="h-4 w-4" /> Loading posts...
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-10 text-center text-white/60">
            No blog posts yet.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-white/10">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-white/10 bg-white/[0.03] text-xs uppercase tracking-wider text-white/50">
                <tr>
                  <th className="px-4 py-3 font-medium">Post</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Published</th>
                  <th className="px-4 py-3 font-medium">Tags</th>
                  <th className="w-16 px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredPosts.map((post) => (
                  <tr key={post._id} className="transition hover:bg-white/[0.025]">
                    <td className="max-w-md px-4 py-4">
                      <p className="font-semibold text-white">{post.title}</p>
                      <p className="mt-1 line-clamp-1 text-xs text-white/50">{post.excerpt}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${post.status === 'published' ? 'bg-green-500/20 text-green-200' : 'bg-yellow-500/20 text-yellow-200'}`}>
                        {post.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-white/60">
                      {post.publishedAt ? new Date(post.publishedAt).toLocaleString() : 'Not scheduled'}
                    </td>
                    <td className="px-4 py-4">
                      {post.tags?.length ? (
                        <div className="flex max-w-52 flex-wrap gap-1.5">
                          {post.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="rounded-full border border-white/10 px-2 py-0.5 text-xs text-white/60">#{tag}</span>
                          ))}
                        </div>
                      ) : <span className="text-white/40">—</span>}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="icon" aria-label={`Actions for ${post.title}`}>
                            <MoreHorizontal aria-hidden="true" className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={() => handleEdit(post)} className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 outline-none focus:bg-white/10">
                            <Pencil aria-hidden="true" className="size-3.5" /> Edit post
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="my-1 h-px bg-white/10" />
                          <DropdownMenuItem onSelect={() => handleDelete(post._id)} className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-rose-300 outline-none focus:bg-rose-500/10">
                            <Trash2 aria-hidden="true" className="size-3.5" /> Delete post
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Drawer
        open={isFormOpen}
        onClose={() => {
          if (!state.loading && !isUploadingToIPFS) resetForm();
        }}
        title={form.id ? 'Edit Blog Post' : 'Create Blog Post'}
        maxWidth="max-w-5xl"
      >
          <div className="admin-panel-form flex h-full max-h-screen w-full max-w-5xl flex-col overflow-hidden rounded-l-2xl border-l border-white/10 bg-[#0d0d0d] shadow-2xl">
            <div className="flex shrink-0 items-center justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-6">
              <h3
                id="blog-form-modal-title"
                className="flex items-center gap-2 text-lg font-semibold text-white"
              >
                <Newspaper className="h-5 w-5 text-slate-300" aria-hidden="true" />
                {form.id ? 'Edit Blog Post' : 'Create Blog Post'}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                type="button"
                onClick={resetForm}
                disabled={state.loading || isUploadingToIPFS}
                aria-label="Close"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5 sm:px-6">
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
                      <FileUpload
                        id="blog-ipfs-file"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        onFilesSelected={handleFileSelect}
                        disabled={isUploadingToIPFS}
                        label="Choose featured image"
                        description="JPEG, PNG, GIF or WebP, up to 10 MB."
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        type="button"
                        onClick={uploadToIPFS}
                        disabled={isUploadingToIPFS || !selectedFile}
                      >
                        {isUploadingToIPFS ? <Spinner className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
                        Upload to IPFS
                      </Button>
                    </div>
                    {selectedFile ? (
                      <p className="mt-2 flex items-center gap-2 text-xs text-white/50">
                        Selected file: <FileType fileName={selectedFile.name} /> <span className="font-medium text-white">{selectedFile.name}</span>
                      </p>
                    ) : null}
                    {form.featuredImage ? (
                      <div className="mt-3 space-y-2">
                        <p className="break-all text-xs text-white/50">
                          Current image: <span className="font-medium text-white/80">{form.featuredImage}</span>
                        </p>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={form.featuredImage}
                          alt="Featured preview"
                          className="max-h-40 w-full rounded-lg border border-white/10 object-cover"
                          onError={(event) => {
                            (event.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="space-y-4">
                  <Field id="blog-status" label="Status">
                    <Combobox
                      id="blog-status"
                      value={form.status}
                      options={[
                        { value: 'draft', label: 'Draft' },
                        { value: 'published', label: 'Published' },
                      ]}
                      onValueChange={(value) => setForm((prev) => ({ ...prev, status: value as 'draft' | 'published' }))}
                      placeholder="Select status"
                      className="mt-1 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white focus:border-cyan-500/60 focus:outline-none"
                    />
                  </Field>
                  <Field id="blog-published-at" label="Published At (optional)">
                    <CalendarInput
                      id="blog-published-at"
                      type="datetime-local"
                      value={form.publishedAt}
                      onChange={(event) => setForm((prev) => ({ ...prev, publishedAt: event.target.value }))}
                      className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white focus:border-cyan-500/60 focus:outline-none"
                    />
                  </Field>
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

              <label className="block text-sm text-white/70">
                Excerpt
                <textarea
                  value={form.excerpt}
                  onChange={(event) => setForm((prev) => ({ ...prev, excerpt: event.target.value }))}
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white focus:border-cyan-500/60 focus:outline-none"
                  placeholder="Short description shown on listing pages"
                />
              </label>

              <div className="flex items-center gap-4">
                <label className="block text-sm text-white/70">
                  Editor Type
                  <select
                    value={form.editorType}
                    onChange={(event) => setForm((prev) => ({ ...prev, editorType: event.target.value as 'simple' | 'quill' }))}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white focus:border-cyan-500/60 focus:outline-none"
                  >
                    <option value="simple">Simple Text</option>
                    <option value="quill">Rich Text (Quill)</option>
                  </select>
                </label>
              </div>

              <label className="block text-sm text-white/70">
                Content
                {form.editorType === 'simple' ? (
                  <textarea
                    value={form.content}
                    onChange={(event) => setForm((prev) => ({ ...prev, content: event.target.value }))}
                    rows={12}
                    className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white focus:border-cyan-500/60 focus:outline-none"
                    placeholder="Write your blog post content here..."
                  />
                ) : (
                  <div className="quill-dark mt-2 overflow-hidden rounded-xl">
                    <div
                      ref={quillContainerRef}
                      className="quill-editor"
                      style={{ minHeight: '320px' }}
                    />
                  </div>
                )}
              </label>

              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
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
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-3 border-t border-white/10 px-5 py-4 sm:px-6">
              <Button
                variant="default"
                size="default"
                type="button"
                onClick={handleSave}
                disabled={state.loading}
              >
                {state.loading ? <Spinner className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                {form.id ? 'Update Post' : 'Create Post'}
              </Button>
              <Button
                variant="outline"
                type="button"
                onClick={resetForm}
                disabled={state.loading || isUploadingToIPFS}
              >
                Cancel
              </Button>
            </div>
          </div>
      </Drawer>
    </div>
  );
};

export default AdminBlogManagerComponent;
