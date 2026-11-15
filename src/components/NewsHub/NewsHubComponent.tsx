import NewshubPage, { type NewshubInitialData } from '@/page-components/Newshub/NewshubPage';

export default function NewsHubComponent({ initialData }: { initialData?: NewshubInitialData }) {
  return <NewshubPage initialData={initialData} />;
}
