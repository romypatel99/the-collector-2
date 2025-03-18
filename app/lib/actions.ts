'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import postgres from 'postgres'; 
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: 'Please select a customer'
  }),
  amount: z.coerce.number().gt(0, { message: 'Please enter an amount greater than $0.' }),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select an invoice status.',
  }),
  date: z.string(),
  description: z.string(),
});

const custFormSchema = z.object({
  id: z.string(),
  customerName: z.string()
})
 
const CreateInvoice = FormSchema.omit({ id: true, date: true });
const CreateCustomer = custFormSchema.omit({ id: true })

export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
    description?: string[];
  };
  message?: string | null;
};

export type CustomerState = {
  errors?: {
    customerName?: string[]
  };
  message?: string | null;
}
 
export async function createInvoice(prevState: State, formData: FormData) {
  // Validate form using Zod
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    description: formData.get('description'),
    status: formData.get('status'),
  });
 
  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }
 
  // Prepare data for insertion into the database
  const { customerId, amount, status, description } = validatedFields.data;
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];
 
  // Insert data into the database
  try {
    await sql`
      INSERT INTO invoices (customer_id, amount, status, date, description)
      VALUES (${customerId}, ${amountInCents}, ${status}, ${date}, ${description})
    `;
  } catch (error) {
    // If a database error occurs, return a more specific error.
    return {
      message: 'Database Error: Failed to Create Invoice.',
    };
  }
 
  // Revalidate the cache for the invoices page and redirect the user.
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

// Add New Customer to the DB
export async function addCustomer(prevState: CustomerState,formData: FormData) {
  const custValidateFields = CreateCustomer.safeParse({
    customerName: formData.get('customername') 
  })
  console.log(custValidateFields)
  // If form validation fails, return errors early. Otherwise, continue.
  if (!custValidateFields.success) {
    return {
      errors: custValidateFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Add Customer.',
    };
  }
  
 
  // Prepare data for insertion into the database
  const { customerName } = custValidateFields.data;
 
  // Insert data into the database
  try {
    await sql`
      INSERT INTO customers (name)
      VALUES (${customerName})
    `;

  } catch (error) {
    // If a database error occurs, return a more specific error.
    console.log(error)
    return {
      message: 'Database Error: Failed to Add Customer.',
    };
  }
  // Revalidate the cache for the invoices page and redirect the user.
  revalidatePath('/dashboard/customers');
  redirect('/dashboard/customers');
}

// Use Zod to update the expected types
const UpdateInvoice = FormSchema.omit({ id: true, date: true });
 
// ...
 
export async function updateInvoice(id: string, formData: FormData) {
  const { customerId, amount, status, description } = UpdateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
    description: formData.get('description')
  });
 
  const amountInCents = amount * 100;
  try {
    await sql`
    UPDATE invoices
    SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}, description = ${description}
    WHERE id = ${id}
  `;
  }
  catch (error) {
    console.log(error)
  }
   
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
  // throw new Error('Failed to Delete Invoice')

  await sql`DELETE FROM invoices WHERE id = ${id}`;
  revalidatePath('/dashboard/invoices');
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}

