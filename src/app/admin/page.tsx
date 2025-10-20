'use client'

import { useEffect } from 'react'

export default function AdminPage() {
    useEffect(() => {
        // Redirect to the static TinaCMS admin interface
        window.location.href = '/admin/index.html'
    }, [])

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p>Redirecting to TinaCMS Admin...</p>
            </div>
        </div>
    )
}
