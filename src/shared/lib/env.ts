function readRequiredEnvValue(name: string, value: string | undefined): string {
  if (value === undefined || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

export const env = {
  supabaseUrl: readRequiredEnvValue(
    'VITE_SUPABASE_URL',
    import.meta.env.VITE_SUPABASE_URL,
  ),
  supabaseAnonKey: readRequiredEnvValue(
    'VITE_SUPABASE_ANON_KEY',
    import.meta.env.VITE_SUPABASE_ANON_KEY,
  ),
} as const
