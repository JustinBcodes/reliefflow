export { default } from 'next-auth/middleware'

export const config = {
  matcher: ['/dashboard/:path*', '/org/:path*', '/api/org/:path*'],
}


