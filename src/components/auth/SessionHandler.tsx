"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function SessionHandler({ children }: { children: React.ReactNode }) {
    const router = useRouter();

    useEffect(() => {
        const checkSession = async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession();

            // Check if we are on an auth page (login/signup)
            const isAuthPage = window.location.pathname.startsWith('/login') || window.location.pathname.startsWith('/signup');

            if (!session && !isAuthPage && window.location.pathname !== '/') {
                router.push("/login");
            } else if (session && isAuthPage) {
                router.push("/dashboard");
            }
        };

        checkSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'SIGNED_IN') {
                // Only redirect to dashboard if we're on an auth page
                const isAuthPage = window.location.pathname.startsWith('/login') || window.location.pathname.startsWith('/signup');
                if (isAuthPage) {
                    router.push('/dashboard');
                }
            } else if (event === 'SIGNED_OUT') {
                router.push('/login');
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [router]);

    return <>{children}</>;
}
