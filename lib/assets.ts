export const ASSETS = {
  logo: '/logo.svg',
  uploads: {
    dir: (userId: number) => `/uploads/${userId}`,
    file: (userId: number, filename: string) => `/uploads/${userId}/${filename}`,
  },
} as const
