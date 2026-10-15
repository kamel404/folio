"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** "Sign in again" → /login, then straight back to the page the user was on. */
function SignInAgainLink() {
  const pathname = usePathname();
  return (
    <Link href={`/login?next=${encodeURIComponent(pathname)}`} className="font-medium underline underline-offset-2">
      Sign in again
    </Link>
  );
}

export { SignInAgainLink };
