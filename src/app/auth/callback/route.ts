import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next')

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data?.user) {
      // Fetch user profile to redirect to the correct role-based dashboard
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('auth_user_id', data.user.id)
        .single()
      
      const role = profile?.role || 'worker'
      const redirectUrl = next ?? (role === 'employer' ? '/dashboard' : '/worker/dashboard')
      
      const forwardedHost = request.headers.get('x-forwarded-host')
      if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${redirectUrl}`)
      }
      return NextResponse.redirect(`${origin}${redirectUrl}`)
    }
  }

  // Redirect to login with error details if exchange fails
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
