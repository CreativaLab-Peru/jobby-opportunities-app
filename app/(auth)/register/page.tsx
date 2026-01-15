'use client';
// import { RegisterForm } from '@/components/auth/register-form';
import {redirect} from "next/navigation";

export default function RegisterPage() {
  // return <RegisterForm />;
  return redirect('login')
}
