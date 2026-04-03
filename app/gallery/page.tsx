"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { Image, Album, Heart, Plus } from "lucide-react";
import { FaGlobeAfrica } from "react-icons/fa";

export default function Gallery() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState("photos");

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

  /*--------- if the gallery is empty ----------*/
  // return (
  //   <div className="h-[95vh] flex flex-col items-center justify-center px-4">
  //     {/*--------- empty state message ----------*/}
  //     <div className="mb-8 text-center">
  //       <p className="text-2xl text-gray-600 font-light">Det finns inget att visa</p>
  //       <p className="text-gray-500 mt-2">Lägga till din första bild</p>
  //     </div>

  //     {/*--------- file upload ----------*/}
  //     <div className="text-center">
  //       <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
  //       <div
  //         onClick={handleClick}
  //         className="grid place-items-center p-10 text-center border-3 border-dashed border-gray-300 rounded-3xl cursor-pointer hover:border-gray-400 transition-colors">
  //         <IoIosCloudUpload className="size-30 text-blue-500" />
  //         <p className="text-xl text-gray-900">Dadda up</p>
  //         <p className="text-gray-500 mt-2">clicka här för att välja</p>
  //       </div>
  //     </div>
  //   </div>
  // );

  /*--------- if gallery is not empty ----------*/
  const filterButtons = [
    { id: "photos", label: "Photos", icon: Image },
    { id: "albums", label: "Albums", icon: Album },
    { id: "favorites", label: "Favorites", icon: Heart },
    { id: "globalt", label: "globalt", icon: FaGlobeAfrica },
  ];

  return (
    <div className="flex sm:p-20 p-4 w-full justify-between mt-8">
      <div className="grid sm:gap-5 gap-3">
        <h1 className="font-bold sm:text-5xl text-2xl">Din dashboard</h1>
        <section className="flex gap-3 flex-wrap">
          {filterButtons.map((btn) => {
            const Icon = btn.icon;
            const isActive = activeTab === btn.id;
            return (
              <button
                key={btn.id}
                onClick={() => setActiveTab(btn.id)}
                className={`flex items-center gap-1 sm:gap-2 px-3 py-2 rounded-xl font-medium transition-all duration-200 cursor-pointer ${
                  isActive ? "bg-gray-900 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}>
                <Icon size={18} />
                {btn.label}
              </button>
            );
          })}
        </section>
      </div>
      <button
        onClick={handleClick}
        className="flex place-self-end items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold h-fit sm:px-4 sm:py-3 px-2 py-1 sm:w-fit w-50 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/40 hover:scale-101 active:scale-95">
        <Plus size={20} />
        Ladda upp
      </button>
    </div>
  );
}
