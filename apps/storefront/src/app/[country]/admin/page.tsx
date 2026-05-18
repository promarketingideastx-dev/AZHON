import { redirect } from 'next/navigation';

export default async function AdminIndexPage({
  params,
}: {
  params: Promise<{ country: string }>;
}) {
  const { country } = await params;
  redirect(`/${country}/admin/sellers`);
}
