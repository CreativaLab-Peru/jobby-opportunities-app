import {getSession} from "@/lib/shared/session";
import {redirect} from "next/navigation";

export default async function Home() {
  const session = await getSession();

  if (session?.success) {
    return redirect('/dashboard');
  }
  return redirect('/login');
}
