import Pagination from '@/app/ui/invoices/pagination';
import Search from '@/app/ui/search';
import HistoryTable from '@/app/ui/invoices/history-table';
import { InvoicesTableSkeleton } from '@/app/ui/skeletons';
import { Suspense } from 'react';
import { fetchInvoicesPages } from '@/app/lib/data';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
 
export default async function Page(props: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;
  const totalPages = await fetchInvoicesPages(query)

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <Breadcrumbs
                breadcrumbs={[
                  { label: 'Invoices', href: '/dashboard/invoices' },
                  {
                    label: 'Invoice History',
                    href: '/dashboard/invoices/history',
                    active: true,
                  },
                ]}
          />  
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="Search invoices..." />
      </div>
      
       <Suspense key={query + currentPage} fallback={<InvoicesTableSkeleton />}>
        <HistoryTable query={query} currentPage={currentPage} />
      </Suspense>
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}