import { lusitana } from '@/app/ui/fonts';
import CustomersTable from '@/app/ui/customers/table';
import { fetchFilteredCustomers } from '@/app/lib/data';
import { Suspense } from 'react';
import { InvoicesTableSkeleton } from '@/app/ui/skeletons';

export const dynamic = 'force-dynamic';
export default async function Page() {
    const [customers] = await Promise.all([fetchFilteredCustomers()]);
    // console.log(customers)

return (
    <main>
        <Suspense fallback={<InvoicesTableSkeleton />}>
            <CustomersTable customers={customers} />
        </Suspense>
    </main>
    
)
}