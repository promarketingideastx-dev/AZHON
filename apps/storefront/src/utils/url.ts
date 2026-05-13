export const getSiteUrl = () => {
  let url = 'http://localhost:3000/';

  if (process.env.VERCEL_ENV === 'preview' && process.env.VERCEL_URL) {
    url = process.env.VERCEL_URL;
  } else if (process.env.NEXT_PUBLIC_SITE_URL) {
    url = process.env.NEXT_PUBLIC_SITE_URL;
  } else if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    url = process.env.NEXT_PUBLIC_VERCEL_URL;
  }
  
  // Make sure to include `https://` when not localhost.
  url = url.includes('http') ? url : `https://${url}`;
  
  // Make sure to not include a trailing `/`.
  url = url.endsWith('/') ? url.slice(0, -1) : url;
  
  return url;
};
