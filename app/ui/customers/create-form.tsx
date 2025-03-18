'use client'
import Link from 'next/link';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import { Button } from '@/app/ui/button';
import { addCustomer, CustomerState } from '@/app/lib/actions';
import { useActionState } from 'react';

export default function Form() {

    const initialState: CustomerState = { message: null, errors: {} };
    const [state, formAction] = useActionState(addCustomer, initialState);

  return (
    <form action={formAction}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        
        {/* Customer Name */}
        <label htmlFor="customername" className="mb-2 block text-sm font-medium">
          Customer Name
        </label>
        <div className="relative mt-2 rounded-md">
            <div className="relative">
              <input
                id="customername"
                name="customername"
                type="text"
                placeholder="Enter Customer Name"
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                required
              />
              <UserCircleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
          </div>
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/dashboard/invoices"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Cancel
        </Link>
        <Button type="submit">Add Customer</Button>
      </div>
    </form>
  );
}
