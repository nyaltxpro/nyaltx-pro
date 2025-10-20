'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AdminCatchAll() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/tina-admin/index.html')
  }, [router])
  return null
}
