import { redirect } from 'next/navigation';
import { getSession } from '@/lib/shared/session';
import { LoginForm } from '@/components/auth/login-form';

export default async function LoginPage() {
  const session = await getSession();
  
  if (session?.success) {
    return redirect('/dashboard');
  }

  return <LoginForm />;
}