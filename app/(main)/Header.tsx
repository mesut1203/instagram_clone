"use client";
import { useEffect, useState } from "react";
import { getCurrentUser, logout } from "../services/auth.action";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const [user, setUser] = useState({} as { fullName: string });
  const [isAuthenticated, setAuthenticated] = useState(false);
  const [isLoading, setLoading] = useState(true);
  const pathname = usePathname();
  useEffect(() => {
    const refetchUser = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) {
          throw new Error("Unathorize");
        }
        setUser(user);
        setAuthenticated(true);
      } catch {
        setAuthenticated(false);
        setUser({} as { fullName: string });
      } finally {
        setLoading(false);
      }
    };
    refetchUser();
  }, [pathname]);

  const handleLogout = async () => {
    await logout();
    setUser({} as { fullName: string });
    setAuthenticated(false);
  };

  return (
    <header className="flex justify-between items-center max-w-300 mx-auto">
      <h1 className="text-3xl">Unicode</h1>
      <ul className="flex gap-3">
        <li>
          <Link href={"/"}>Home</Link>
        </li>
        <li>
          <Link href={"/about"}>About</Link>
        </li>
        <li>
          <Link href={"/products"}>Products</Link>
        </li>

        {isLoading ? (
          <li>Loading...</li>
        ) : isAuthenticated ? (
          <>
            <li>Chào: {user.fullName}</li>
            <li>
              <button onClick={handleLogout}>Logout</button>
            </li>
          </>
        ) : (
          <li>
            <Link href={"/login"}>Login</Link>
          </li>
        )}
      </ul>
    </header>
  );
}
