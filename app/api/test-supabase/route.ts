import { supabase } from '@/utils/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { data, error } = await supabase.from('test').select('*').limit(1)
    if (error) throw error
    return NextResponse.json({ connected: true, data })
  } catch (error: any) {
    return NextResponse.json({ connected: false, error: error.message }, { status: 500 })
  }
}   