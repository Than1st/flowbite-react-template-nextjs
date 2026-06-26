"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Spinner } from "flowbite-react";
import { isAuthenticated } from "@/lib/auth";

export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace(isAuthenticated() ? "/dashboard" : "/login");
    }, 1000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary-800">
      <Image
        src="/assets/image/immax.png"
        alt="IMMAX"
        width={160}
        height={160}
        className="h-28 w-auto object-contain"
        priority
      />
      <Spinner size="lg" color="info" className="mt-6" aria-label="Loading" />
      <h1 className="mt-4 font-heading text-3xl text-white">IMMAX</h1>
      <p className="mt-2 text-sm text-secondary-200">
        Intensive Monitoring Maximum System
      </p>
    </div>
  );
}
