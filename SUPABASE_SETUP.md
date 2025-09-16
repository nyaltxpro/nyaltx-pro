# Supabase Banner Storage Setup

## Environment Variables Required

Add these to your `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Supabase Setup Steps

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note down your project URL and API keys

2. **Storage Bucket Configuration**
   - The banner management system will automatically create a `banners` bucket
   - Bucket settings:
     - Public: Yes
     - File size limit: 10MB
     - Allowed MIME types: image/jpeg, image/png, image/gif, image/webp

3. **RLS Policies (Optional)**
   - For admin-only access, you can set up Row Level Security policies
   - The current implementation uses service role key for admin operations

## Features

- ✅ Automatic bucket creation
- ✅ File upload with unique naming (timestamp prefix)
- ✅ Public URL generation
- ✅ File listing and management
- ✅ File deletion
- ✅ Image preview in admin panel

## Usage

Once configured, admins can:
1. Upload banner images through `/admin/banners`
2. View all uploaded banners with previews
3. Copy public URLs for use in components
4. Delete unwanted banners

Banner URLs will be in format:
`https://your-project.supabase.co/storage/v1/object/public/banners/filename.jpg`
