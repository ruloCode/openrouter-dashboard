import KeyDetailRoute from '@/components/KeyDetailRoute';

export function generateStaticParams() {
  return [];
}

export default function Page({ params }: { params: Promise<{ keyName: string }> }) {
  return <KeyDetailRoute params={params} />;
}
