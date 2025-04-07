import { verifyToken } from "@/actions/auth";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";


export const useAuth = () => {
  const { data: session, status } = useSession();
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);

  useEffect(() => {
    const verifyAuth = async () => {
      if (session?.access_token) {
        try {
          await verifyToken(session.access_token);
          setIsTokenValid(true);
        } catch (error) {
          setIsTokenValid(false);
        }
      } else {
        setIsTokenValid(false);
      }
    };

    verifyAuth();
  }, [session]);

  const isAuthenticated = (
    status === "authenticated" && !!session?.user
  );

  return {
    session: session,
    user: session?.user,
    accessToken: session?.access_token,
    refreshToken: session?.refresh_token,
    isLoading: status === "loading" || isTokenValid === null,
    isAuthenticated,
  };
};