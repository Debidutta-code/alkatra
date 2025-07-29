// extranet/src/app/page.tsx
'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

const Page = () => {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to /app on component mount
    router.replace('/app')
  }, [router])
  
  // Show loading state while redirecting
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div>Loading...</div>
    </div>
  )
}

export default Page