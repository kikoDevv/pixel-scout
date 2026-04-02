"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setLoading(false);
      } else {
        router.push("/sign-in");
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return <div className="h-screen flex items-center justify-center">Laddar...</div>;
  }

  return (
    <div className="min-h-screen pt-20">
      <section className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-4">Välkommen till Dashboard</h1>
        <p className="text-xl text-gray-300 mb-6">Hej, {user?.email}</p>
        <div className="bg-neutral-900 border border-white/15 rounded-xl p-8">
          <p className="text-gray-300">Här ska användarens uppgift vara--.</p>
        </div>
      </section>
    </div>
  );
}
