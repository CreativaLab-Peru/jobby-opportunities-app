import { auth } from "@/lib/auth";
import { headers } from "next/headers";
export async function getSession() {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return {
        success: false,
        message: "No authenticated",
      };
    }
    return {
        success: true,
        user: {
            id: session.user?.id || null,
            email: session.user?.email || null,
            name: session.user?.name || null,
            image: session.user?.image || null,
        }
    };
}