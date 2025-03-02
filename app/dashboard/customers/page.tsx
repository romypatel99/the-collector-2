import { lusitana } from '@/app/ui/fonts';
import CustomersTable from '@/app/ui/customers/table';
import { fetchFilteredCustomers } from '@/app/lib/data';
import { Suspense } from 'react';
 
export default async function Page() {
    const [customers] = await Promise.all([fetchFilteredCustomers()]);
    console.log(customers)

return (
    <main>
        <Suspense>
            <CustomersTable customers={customers} />
        </Suspense>
    </main>
    
)
}