"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

export default function Gallery() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  /*--------- Check if user is authenticated ----------*/
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is logged in
        setIsAuthenticated(true);
        setUserEmail(user.email || "");
        setIsLoading(false);
      } else {
        // User is not logged in, redirect to sign-in
        alert("Du behöver logga in först för att see din gallerier!");
        router.push("/sign-in");
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-80px)] flex items-center justify-center">
        <p className="text-xl font-semibold text-gray-600">Laddar...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Gallery Items</h1>
        <p className="text-lg text-gray-600">
          Inloggad som: <span className="font-semibold text-blue-600">{userEmail}</span>
        </p>
      </div>
    </div>
  );
}
