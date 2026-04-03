"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { IoIosCloudUpload } from "react-icons/io";

export default function Gallery() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  /*--------- Check if user is authenticated ----------*/
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        setIsLoading(false);
      } else {
        alert("Du behöver logga in först för att see din gallerier!");
        router.push("/sign-in");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      console.log("Selected file:", files[0].name);
      // file handling logic here
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

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
    <div className="h-[95vh] flex items-center justify-center">
      {/*--------- file upload ----------*/}
      <div className="text-center">
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
        <div
          onClick={handleClick}
          className="grid place-items-center p-10 text-center border-3 border-dashed border-gray-300 rounded-3xl cursor-pointer hover:border-gray-400 transition-colors">
          <IoIosCloudUpload className="size-30 text-blue-500" />
          <p className="text-xl text-gray-900">Dadda up</p>
          <p className="text-gray-500 mt-2">clicka här för att välja</p>
        </div>
      </div>
    </div>
  );
}
