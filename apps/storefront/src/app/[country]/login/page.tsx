import { redirect } from 'next/navigation';

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ country: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { country } = await params;
  const sParams = await searchParams;
  
  const qs = new URLSearchParams();
  if (sParams?.intent) qs.append('intent', sParams.intent as string);
  if (sParams?.next) qs.append('next', sParams.next as string);
  
  const qsStr = qs.toString();
  redirect(`/${country}/auth-v2/start${qsStr ? `?${qsStr}` : ''}`);
}
