"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db, storage } from "@/lib/firebase/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { Image, Album, Heart, Plus, X, Lock, Globe } from "lucide-react";
import { FaCommentDots, FaGlobeAfrica, FaRegHeart } from "react-icons/fa";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  deleteDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { IoIosImages, IoMdGlobe } from "react-icons/io";
import { MdFolder } from "react-icons/md";
import FooterSection from "@/components/ui/footer";
import { FaCircleArrowUp } from "react-icons/fa6";
import { IoCloudDownloadSharp, IoLockClosed } from "react-icons/io5";
import { LuClock12 } from "react-icons/lu";
import { TbPhotoDown, TbSquareHalf } from "react-icons/tb";
import { MdContentCopy, MdDelete } from "react-icons/md";
import { BsThreeDots } from "react-icons/bs";

/*--------- Photo Type Definition ----------*/
interface Photo {
  id: string;
  uid: string;
  albumId: string;
  name: string;
  description: string;
  imageUrl: string;
  storagePath: string;
  originalImageUrl?: string;
  originalStoragePath?: string;
  hasWatermark?: boolean;
  isPublic: boolean;
  likes?: string[];
  comments?: any[];
  createdAt: any;
}

export default function Gallery() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState("");
  const [activeTab, setActiveTab] = useState("Explore");

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [photoNames, setPhotoNames] = useState<string[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState("");
  const [createNewAlbum, setCreateNewAlbum] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState("");
  const [newAlbumIsPublic, setNewAlbumIsPublic] = useState(false);
  const [newAlbumAddWatermark, setNewAlbumAddWatermark] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [copiedAlbumId, setCopiedAlbumId] = useState<string | null>(null);
  const [currentUploadedAlbumId, setCurrentUploadedAlbumId] = useState<string>("");
  const [creatingAlbumForShare, setCreatingAlbumForShare] = useState(false);

  // Content states
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [userAlbums, setUserAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [openedAlbumId, setOpenedAlbumId] = useState<string | null>(null);
  const [openedAlbumName, setOpenedAlbumName] = useState<string>("");
  const [albumPhotos, setAlbumPhotos] = useState<Photo[]>([]);
  const [albumPhotoCounts, setAlbumPhotoCounts] = useState<{ [key: string]: number }>({});

  // Photo detail viewer states
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [photoUploaderInfo, setPhotoUploaderInfo] = useState<any>(null);
  const [loadingPhotoDetail, setLoadingPhotoDetail] = useState(false);
  const [showUploaderInfo, setShowUploaderInfo] = useState(false);
  const [showComment, setShowComment] = useState(false);
  const [likes, setLikes] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [currentUserInfo, setCurrentUserInfo] = useState<any>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [downloadRequestStatus, setDownloadRequestStatus] = useState<string | null>(null);
  const [downloadingAlbum, setDownloadingAlbum] = useState(false);
  const [albumActionsDropdown, setAlbumActionsDropdown] = useState(false);
  const [albumOwnerId, setAlbumOwnerId] = useState<string | null>(null);
  const [deletingAlbum, setDeletingAlbum] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  /*--------- Check if user is authenticated ----------*/
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        setUserId(user.uid);
        setIsLoading(false);
        fetchAlbums(user.uid);
      } else {
        // Allow non-authenticated users to view public photos
        setIsAuthenticated(false);
        setActiveTab("Explore"); // Default to public photos
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  /*--------- Handle album share link (albumId from query params) ----------*/
  useEffect(() => {
    const handleAlbumShareLink = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const albumId = searchParams.get("albumId");

      if (albumId) {
        try {
          // Fetch photos from this album
          const q = query(collection(db, "photos"), where("albumId", "==", albumId));
          const snapshot = await getDocs(q);
          const photosData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Photo[];

          if (photosData.length > 0) {
            let albumName = albumId;
            let albumOwnerUid = null;
            try {
              const albumDoc = await getDoc(doc(db, "albums", albumId));
              if (albumDoc.exists()) {
                albumName = albumDoc.data().name;
                albumOwnerUid = albumDoc.data().uid;
              }
            } catch (albumError) {
              console.debug("Could not fetch album name:", albumError);
            }

            setAlbumPhotos(photosData);
            setOpenedAlbumId(albumId);
            setOpenedAlbumName(albumName);
            setAlbumOwnerId(albumOwnerUid);
            setActiveTab("albums");
          } else {
            alert("Album hittas inte eller innehåller inga foton");
          }
        } catch (error: any) {
          console.error("Error fetching shared album:", error);
          alert("Fel vid hämtning av album");
        }
      }
    };

    // Only run if document is available (client-side)
    if (typeof window !== "undefined") {
      handleAlbumShareLink();
    }
  }, [isAuthenticated, userId]);

  /*--------- Handle pending download request after login ----------*/
  useEffect(() => {
    const handlePendingRequest = async () => {
      if (typeof window === "undefined") return;

      const searchParams = new URLSearchParams(window.location.search);
      const pendingPhotoId = searchParams.get("pendingPhotoId");
      const pendingSendRequest = searchParams.get("pendingSendRequest");

      // Only proceed if user is authenticated and we have a pending request
      if (!isAuthenticated || !userId || !currentUserInfo || !pendingPhotoId || pendingSendRequest !== "true") {
        return;
      }

      // Check if the photo is in the current album
      const photo = albumPhotos.find((p) => p.id === pendingPhotoId);
      if (photo) {
        // Send the request silently
        await sendDownloadRequestInternal(photo, currentUserInfo);

        // Update URL to remove the pending request params
        const newSearchParams = new URLSearchParams(window.location.search);
        newSearchParams.delete("pendingPhotoId");
        newSearchParams.delete("pendingSendRequest");

        const newUrl = newSearchParams.toString()
          ? `/gallery?${newSearchParams.toString()}`
          : `/gallery?${new URLSearchParams(window.location.search).toString()}`;

        window.history.replaceState({}, "", newUrl);
      }
    };

    handlePendingRequest();
  }, [isAuthenticated, userId, currentUserInfo, albumPhotos]);

  /*--------- Fetch user's albums ----------*/
  const fetchAlbums = async (uid: string) => {
    try {
      const q = query(collection(db, "albums"), where("uid", "==", uid));
      const snapshot = await getDocs(q);
      const albumsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAlbums(albumsData);
    } catch (error) {
      console.error("Error fetching albums:", error);
    }
  };

  /*--------- Fetch content based on active tab ----------*/
  const fetchContent = async (tab: string, uid: string) => {
    setLoading(true);
    try {
      if (tab === "photos") {
        const q = query(collection(db, "photos"), where("uid", "==", uid));
        const snapshot = await getDocs(q);
        const photosData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Photo[];
        setPhotos(photosData);
      } else if (tab === "albums") {
        const q = query(collection(db, "albums"), where("uid", "==", uid));
        const snapshot = await getDocs(q);
        const albumsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUserAlbums(albumsData);
      } else if (tab === "Explore") {
        const q = query(collection(db, "photos"), where("isPublic", "==", true));
        const snapshot = await getDocs(q);
        const photosData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Photo[];
        setPhotos(photosData);
      } else if (tab === "favorites") {
        // Fetch public photos and user's own photos
        try {
          // Query public photos
          const publicQ = query(collection(db, "photos"), where("isPublic", "==", true));
          const publicSnapshot = await getDocs(publicQ);
          const publicPhotos = publicSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Photo[];

          // Query user's own photos
          const ownQ = query(collection(db, "photos"), where("uid", "==", uid));
          const ownSnapshot = await getDocs(ownQ);
          const ownPhotos = ownSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Photo[];

          // Combine both results and remove duplicates
          const allAccessiblePhotos = [...publicPhotos, ...ownPhotos];
          const uniquePhotos = Array.from(new Map(allAccessiblePhotos.map((photo) => [photo.id, photo])).values());

          // Filter photos where current user has liked
          const likedPhotos = uniquePhotos.filter((photo) => photo.likes && photo.likes.includes(uid));
          setPhotos(likedPhotos);
        } catch (error) {
          console.error("Error fetching favorites:", error);
          setPhotos([]);
        }
      }
    } catch (error) {
      console.error("Error fetching content:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchContent(activeTab, userId);
    } else if (activeTab === "Explore") {
      // For non-authenticated users, only allow viewing public photos
      fetchContent("Explore", "");
    }
  }, [activeTab, userId]);

  /*--------- Fetch photos from a specific album ----------*/
  const fetchAlbumPhotos = async (albumId: string, albumName: string) => {
    setLoading(true);
    try {
      // Query photos by albumId and ensure user has permission (owns photo OR photo is public)
      const q = query(
        collection(db, "photos"),
        where("albumId", "==", albumId),
        where("uid", "==", userId), // Only get photos owned by current user
      );
      const snapshot = await getDocs(q);
      const photosData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Photo[];
      setAlbumPhotos(photosData);
      setOpenedAlbumId(albumId);
      setOpenedAlbumName(albumName);
      setAlbumOwnerId(userId); // Current user is the owner of their own albums
    } catch (error) {
      console.error("Error fetching album photos:", error);
    } finally {
      setLoading(false);
    }
  };

  /*--------- Delete album with all photos ----------*/
  const deleteAlbum = async () => {
    if (!openedAlbumId || userId !== albumOwnerId) return;

    setDeletingAlbum(true);
    try {
      // Delete all photos in the album from storage and database
      for (const photo of albumPhotos) {
        // Delete original image from storage
        if (photo.originalStoragePath) {
          try {
            const originalRef = ref(storage, photo.originalStoragePath);
            await deleteObject(originalRef);
          } catch (error) {
            console.error("Error deleting original image:", error);
          }
        }

        // Delete watermarked/display image from storage
        if (photo.storagePath) {
          try {
            const displayRef = ref(storage, photo.storagePath);
            await deleteObject(displayRef);
          } catch (error) {
            console.error("Error deleting display image:", error);
          }
        }

        // Delete photo document from Firestore
        try {
          await deleteDoc(doc(db, "photos", photo.id));
        } catch (error) {
          console.error("Error deleting photo document:", error);
        }
      }

      // Delete the album document itself
      await deleteDoc(doc(db, "albums", openedAlbumId));

      alert("Album och alla foton har tagits bort");
      closeAlbumDetail();
      // Refresh albums list
      fetchAlbums(userId);
    } catch (error) {
      console.error("Error deleting album:", error);
      alert("Fel vid borttagning av album");
    } finally {
      setDeletingAlbum(false);
      setShowDeleteConfirm(false);
    }
  };

  /*--------- Close album detail view ----------*/
  const closeAlbumDetail = () => {
    setOpenedAlbumId(null);
    setAlbumOwnerId(null);
    setOpenedAlbumName("");
    setAlbumPhotos([]);
  };

  /*--------- Calculate photo counts for all albums ----------*/
  const calculateAlbumPhotoCounts = async (uid: string) => {
    try {
      const q = query(collection(db, "photos"), where("uid", "==", uid));
      const snapshot = await getDocs(q);
      const counts: { [key: string]: number } = {};

      snapshot.docs.forEach((doc) => {
        const albumId = doc.data().albumId || "general";
        counts[albumId] = (counts[albumId] || 0) + 1;
      });

      setAlbumPhotoCounts(counts);
    } catch (error) {
      console.error("Error calculating album photo counts:", error);
    }
  };

  /*--------- Recalculate counts when albums tab is active ----------*/
  useEffect(() => {
    if (activeTab === "albums" && userId) {
      calculateAlbumPhotoCounts(userId);
    }
  }, [activeTab, userId]);

  /*--------- Fetch uploader info for selected photo ----------*/
  const fetchPhotoUploaderInfo = async (photo: any) => {
    setLoadingPhotoDetail(true);
    setSelectedPhoto(photo);
    try {
      const userRef = doc(db, "users", photo.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setPhotoUploaderInfo(userSnap.data());
      }

      // Fetch likes and comments for all users (authenticated and non-authenticated)
      await fetchLikesAndComments(photo.id);

      // Fetch current user info only if authenticated
      if (isAuthenticated) {
        const currentUserRef = doc(db, "users", userId);
        const currentUserSnap = await getDoc(currentUserRef);
        if (currentUserSnap.exists()) {
          setCurrentUserInfo(currentUserSnap.data());
        }

        // Check if user has a download request for this photo
        await checkDownloadRequestStatus(photo.id);
      }
    } catch (error) {
      console.error("Error fetching uploader info:", error);
    } finally {
      setLoadingPhotoDetail(false);
    }
  };

  /*--------- Fetch likes and comments for selected photo ----------*/
  const fetchLikesAndComments = async (photoId: string) => {
    try {
      const photoRef = doc(db, "photos", photoId);
      const photoSnap = await getDoc(photoRef);
      if (photoSnap.exists()) {
        const photoData = photoSnap.data();
        setLikes(photoData.likes || []);
        setComments(photoData.comments || []);
        setIsLiked(photoData.likes?.includes(userId) || false);
      }
    } catch (error) {
      console.error("Error fetching likes and comments:", error);
    }
  };

  /*--------- Add or remove like ----------*/
  const toggleLike = async () => {
    if (!isAuthenticated || !selectedPhoto) return;

    try {
      const photoRef = doc(db, "photos", selectedPhoto.id);
      if (isLiked) {
        await updateDoc(photoRef, {
          likes: arrayRemove(userId),
        });
        setLikes(likes.filter((id) => id !== userId));
      } else {
        await updateDoc(photoRef, {
          likes: arrayUnion(userId),
        });
        setLikes([...likes, userId]);
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  /*--------- Add comment ----------*/
  const addComment = async () => {
    if (!isAuthenticated || !newComment.trim() || !selectedPhoto || !currentUserInfo) return;

    try {
      const photoRef = doc(db, "photos", selectedPhoto.id);
      const comment = {
        userId,
        username: currentUserInfo.name || currentUserInfo.email,
        text: newComment,
        createdAt: new Date(),
        profileImage: currentUserInfo.profileImage,
      };

      await updateDoc(photoRef, {
        comments: arrayUnion(comment),
      });

      setComments([...comments, comment]);
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  /*--------- Check download request status ----------*/
  const checkDownloadRequestStatus = async (photoId: string) => {
    if (!isAuthenticated || !userId) return;

    try {
      const q = query(
        collection(db, "download_requests"),
        where("photoId", "==", photoId),
        where("requesterId", "==", userId),
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setDownloadRequestStatus(null);
      } else {
        const request = snapshot.docs[0].data();
        setDownloadRequestStatus(request.status); // "pending" or "accepted"
      }
    } catch (error) {
      console.error("Error checking download request:", error);
    }
  };

  /*--------- Send download request ----------*/
  const sendDownloadRequest = async () => {
    if (!selectedPhoto) return;

    // If not authenticated, redirect to sign-in
    if (!isAuthenticated) {
      const searchParams = new URLSearchParams(window.location.search);
      const albumId = searchParams.get("albumId");
      const returnUrl = new URLSearchParams({
        returnTo: `/gallery?albumId=${albumId}`,
        pendingPhotoId: selectedPhoto.id,
        pendingSendRequest: "true",
      }).toString();
      router.push(`/sign-in?${returnUrl}`);
      return;
    }

    if (!currentUserInfo) return;

    try {
      // Check if request already exists
      const q = query(
        collection(db, "download_requests"),
        where("photoId", "==", selectedPhoto.id),
        where("requesterId", "==", userId),
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        alert("Du har redan skickat en begäran för denna bild");
        return;
      }

      // Create new request
      await addDoc(collection(db, "download_requests"), {
        photoId: selectedPhoto.id,
        photoName: selectedPhoto.name,
        ownerId: selectedPhoto.uid,
        requesterId: userId,
        requesterName: currentUserInfo.name || currentUserInfo.email,
        requesterEmail: currentUserInfo.email,
        status: "pending",
        createdAt: new Date(),
      });

      setDownloadRequestStatus("pending");
      alert("Din förfrågan är skickad. Du ser en nedladdningsikon när ägaren godkännt!");
    } catch (error) {
      console.error("Error sending download request:", error);
      alert("Fel vid skickning av begäran");
    }
  };

  /*--------- Internal helper to send download request without UI ----------*/
  const sendDownloadRequestInternal = async (photo: Photo, userInfo: any) => {
    try {
      // Check if request already exists
      const q = query(
        collection(db, "download_requests"),
        where("photoId", "==", photo.id),
        where("requesterId", "==", userId),
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        console.log("Download request already exists for this photo");
        return true; // Return true to indicate we should update UI
      }

      // Create new request
      await addDoc(collection(db, "download_requests"), {
        photoId: photo.id,
        photoName: photo.name,
        ownerId: photo.uid,
        requesterId: userId,
        requesterName: userInfo.name || userInfo.email,
        requesterEmail: userInfo.email,
        status: "pending",
        createdAt: new Date(),
      });

      setDownloadRequestStatus("pending");
      return true;
    } catch (error) {
      console.error("Error sending download request:", error);
      return false;
    }
  };

  /*--------- Handle download ----------*/
  const handleDownload = async () => {
    if (!selectedPhoto) return;

    try {
      // Use server-side API to download (avoids CORS issues)
      const downloadUrl = selectedPhoto.originalImageUrl || selectedPhoto.imageUrl;

      const response = await fetch("/api/download-photo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          downloadUrl: downloadUrl,
          filename: `${selectedPhoto.name}`,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();

      // Create download link from blob
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${selectedPhoto.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading photo:", error);
      alert("Fel vid nedladdning");
    }
  };

  /*--------- Close photo detail viewer ----------*/
  const closePhotoDetail = () => {
    setSelectedPhoto(null);
    setPhotoUploaderInfo(null);
    setShowUploaderInfo(false);
    setShowComment(false);
    setLikes([]);
    setComments([]);
    setNewComment("");
    setIsLiked(false);
    setDownloadRequestStatus(null);
  };

  /*--------- Auto-switch info display every 4 seconds ----------*/
  useEffect(() => {
    if (selectedPhoto) {
      setShowUploaderInfo(false);
      const timer = setTimeout(() => {
        setShowUploaderInfo(true);
      }, 4000);

      const loopTimer = setInterval(() => {
        setShowUploaderInfo((prev) => !prev);
      }, 8000);

      return () => {
        clearTimeout(timer);
        clearInterval(loopTimer);
      };
    }
  }, [selectedPhoto]);

  /*--------- Disable background scroll when modal is open ----------*/
  useEffect(() => {
    if (selectedPhoto) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedPhoto]);

  /*--------- Handle file selection ----------*/
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const filesArray = Array.from(files);
      setSelectedFiles(filesArray);

      // Set photo names from file names and create previews
      const newNames = filesArray.map((file) => file.name);
      setPhotoNames(newNames);

      // Create previews for all files
      const previewPromises = filesArray.map((file) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            resolve(event.target?.result as string);
          };
          reader.readAsDataURL(file);
        });
      });

      Promise.all(previewPromises).then((previewUrls) => {
        setPreviews(previewUrls);
      });

      setShowModal(true);
    }
  };

  /*--------- Apply watermark to image ----------*/
  const applyWatermark = (imageFile: File, userName: string): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement("img");
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            reject(new Error("Could not get canvas context"));
            return;
          }

          // Draw image
          ctx.drawImage(img, 0, 0);

          // Apply watermark
          const fontSize = Math.max(img.width / 12, 40);
          ctx.font = `bold ${fontSize}px Arial`;
          ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
          ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
          ctx.lineWidth = 2;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          // Draw watermark text diagonally across the center
          ctx.save();
          ctx.translate(img.width / 2, img.height / 2);
          ctx.rotate((-Math.PI / 180) * 25);
          ctx.strokeText(`© ${userName} - Pixel Scout`, 0, 0);
          ctx.fillText(`© ${userName} - Pixel Scout`, 0, 0);
          ctx.restore();

          // Convert canvas to blob and create file
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const watermarkedFile = new File([blob], imageFile.name, { type: imageFile.type });
                resolve(watermarkedFile);
              } else {
                reject(new Error("Could not create blob from canvas"));
              }
            },
            imageFile.type,
            0.9,
          );
        };
        img.onerror = () => reject(new Error("Could not load image"));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error("Could not read file"));
      reader.readAsDataURL(imageFile);
    });
  };

  /*--------- Copy Album Link ----------*/
  const copyAlbumLink = async (albumId: string) => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    const albumLink = `${baseUrl}/gallery?albumId=${albumId}`;

    try {
      await navigator.clipboard.writeText(albumLink);
      setCopiedAlbumId(albumId);

      // Reset the copy notification after 2 seconds
      setTimeout(() => {
        setCopiedAlbumId(null);
      }, 2000);
    } catch (error) {
      console.error("Error copying link:", error);
      alert("Kunde inte kopiera länk");
    }
  };

  /*--------- Handle Copy Link with auto-album creation ----------*/
  const handleCopyLinkWithCreation = async () => {
    // If selected existing album, just copy the link
    if (selectedAlbum) {
      copyAlbumLink(selectedAlbum);
      return;
    }

    // If album already created, just copy the link
    if (currentUploadedAlbumId) {
      copyAlbumLink(currentUploadedAlbumId);
      return;
    }

    // If it's a new album, create it first
    if (createNewAlbum && newAlbumName.trim()) {
      setCreatingAlbumForShare(true);
      try {
        const albumRef = await addDoc(collection(db, "albums"), {
          uid: userId,
          name: newAlbumName,
          isPublic: newAlbumIsPublic,
          hasWatermark: newAlbumAddWatermark,
          createdAt: new Date(),
        });

        setCurrentUploadedAlbumId(albumRef.id);
        await copyAlbumLink(albumRef.id);
      } catch (error) {
        console.error("Error creating album for share:", error);
        alert("Fel vid skapande av album");
      } finally {
        setCreatingAlbumForShare(false);
      }
    }
  };

  /*--------- Handle Copy Link + Upload (combined action) ----------*/
  const handleCopyLinkAndUpload = async () => {
    // Validate files first
    if (selectedFiles.length === 0 || photoNames.some((name) => !name.trim())) {
      alert("Välj filer och ge dem namn");
      return;
    }

    // Require album selection
    if (!selectedAlbum && !createNewAlbum) {
      alert("Du måste välja eller skapa ett album");
      return;
    }

    if (createNewAlbum && !newAlbumName.trim()) {
      alert("Ge albumet ett namn");
      return;
    }

    setUploading(true);
    try {
      let albumId = selectedAlbum || currentUploadedAlbumId;
      let albumIsPublic = false;
      let albumAddWatermark = false;

      // Create album if needed
      if (createNewAlbum && !currentUploadedAlbumId && newAlbumName.trim()) {
        const albumRef = await addDoc(collection(db, "albums"), {
          uid: userId,
          name: newAlbumName,
          isPublic: newAlbumIsPublic,
          hasWatermark: newAlbumAddWatermark,
          createdAt: new Date(),
        });
        albumId = albumRef.id;
        setCurrentUploadedAlbumId(albumId);
        albumIsPublic = newAlbumIsPublic;
        albumAddWatermark = newAlbumAddWatermark;

        // Copy the link after album is created
        await copyAlbumLink(albumId);
      } else if (createNewAlbum && currentUploadedAlbumId) {
        albumId = currentUploadedAlbumId;
        albumIsPublic = newAlbumIsPublic;
        albumAddWatermark = newAlbumAddWatermark;
      } else if (selectedAlbum) {
        const albumDoc = await getDoc(doc(db, "albums", selectedAlbum));
        if (albumDoc.exists()) {
          albumIsPublic = albumDoc.data().isPublic || false;
          albumAddWatermark = albumDoc.data().hasWatermark || false;
        }
      }

      // Fetch user info if needed for watermarking
      let userInfo = currentUserInfo;
      if (albumAddWatermark && !userInfo) {
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          userInfo = userSnap.data();
        }
      }
      const userName = userInfo?.name || userInfo?.email || "User";

      // Upload all files
      for (let i = 0; i < selectedFiles.length; i++) {
        const selectedFile = selectedFiles[i];
        const photoName = photoNames[i];

        // Upload original file first
        const originalStoragePath = `gallery/${userId}/${Date.now()}-${i}-${selectedFile.name}`;
        const originalStorageRef = ref(storage, originalStoragePath);
        await uploadBytes(originalStorageRef, selectedFile);
        const originalImageUrl = await getDownloadURL(originalStorageRef);

        let displayImageUrl = originalImageUrl;
        let displayStoragePath = originalStoragePath;

        // Apply watermark if enabled
        if (albumAddWatermark) {
          const watermarkedFile = await applyWatermark(selectedFile, userName);
          const watermarkStoragePath = `gallery/${userId}/${Date.now()}-${i}-watermark-${selectedFile.name}`;
          const watermarkStorageRef = ref(storage, watermarkStoragePath);
          await uploadBytes(watermarkStorageRef, watermarkedFile);
          displayImageUrl = await getDownloadURL(watermarkStorageRef);
          displayStoragePath = watermarkStoragePath;
        }

        // Add photo to database
        await addDoc(collection(db, "photos"), {
          uid: userId,
          albumId: albumId,
          name: photoName,
          description: "",
          imageUrl: displayImageUrl,
          storagePath: displayStoragePath,
          originalImageUrl: originalImageUrl,
          originalStoragePath: originalStoragePath,
          hasWatermark: albumAddWatermark,
          isPublic: albumIsPublic,
          createdAt: new Date(),
        });
      }

      alert(`${selectedFiles.length} bilder uppladdad till albumet!`);
      closeUploadModal();
      fetchAlbums(userId);
    } catch (error) {
      console.error("Error uploading:", error);
      alert("Fel vid uppladdning");
    } finally {
      setUploading(false);
    }
  };

  /*--------- Download all album photos ----------*/
  const downloadAlbumPhotos = async () => {
    if (!openedAlbumId || albumPhotos.length === 0) {
      alert("Inget album eller inga foton att ladda ner");
      return;
    }

    setDownloadingAlbum(true);
    try {
      // Get album info to check watermark status
      let hasWatermark = false;
      try {
        const albumDoc = await getDoc(doc(db, "albums", openedAlbumId));
        if (albumDoc.exists()) {
          hasWatermark = albumDoc.data().hasWatermark || false;
        }
      } catch (error) {
        console.debug("Could not fetch album watermark status:", error);
      }

      // Download each photo
      for (let i = 0; i < albumPhotos.length; i++) {
        const photo = albumPhotos[i];

        // Choose download URL based on watermark status
        const downloadUrl = hasWatermark ? photo.imageUrl : photo.originalImageUrl || photo.imageUrl;

        try {
          // Call server-side API to download (avoids CORS issues)
          const response = await fetch("/api/download-photo", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              downloadUrl: downloadUrl,
              filename: `${photo.name}.jpg`,
            }),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const blob = await response.blob();

          // Create download link
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `${photo.name}.jpg`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);

          // Small delay between downloads to avoid overwhelming the browser
          await new Promise((resolve) => setTimeout(resolve, 500));
        } catch (error) {
          console.error(`Error downloading photo ${photo.name}:`, error);
        }
      }

      alert(`${albumPhotos.length} bilder nedladdade!`);
    } catch (error) {
      console.error("Error downloading album:", error);
      alert("Fel vid nedladdning av album");
    } finally {
      setDownloadingAlbum(false);
    }
  };

  /*--------- Close upload modal and reset state ----------*/
  const closeUploadModal = () => {
    setShowModal(false);
    // Clear all upload state
    setSelectedFiles([]);
    setPreviews([]);
    setPhotoNames([]);
    setSelectedAlbum("");
    setCreateNewAlbum(false);
    setNewAlbumName("");
    setNewAlbumIsPublic(false);
    setNewAlbumAddWatermark(false);
    setCurrentUploadedAlbumId("");
  };

  /*--------- Handle upload ----------*/
  const handleUpload = async () => {
    if (selectedFiles.length === 0 || photoNames.some((name) => !name.trim())) {
      alert("Välj filer och ge dem namn");
      return;
    }

    // Require album selection
    if (!selectedAlbum && !createNewAlbum) {
      alert("Du måste välja eller skapa ett album");
      return;
    }

    if (createNewAlbum && !newAlbumName.trim()) {
      alert("Ge albumet ett namn");
      return;
    }

    setUploading(true);
    try {
      // Create or use album
      let albumId = selectedAlbum || currentUploadedAlbumId;
      let albumIsPublic = false;
      let albumAddWatermark = false;

      if (createNewAlbum && currentUploadedAlbumId) {
        // Album was already created (via Copy Link or Email Share)
        // Just get its settings from the state
        albumId = currentUploadedAlbumId;
        albumIsPublic = newAlbumIsPublic;
        albumAddWatermark = newAlbumAddWatermark;
      } else if (createNewAlbum && newAlbumName.trim() && !currentUploadedAlbumId) {
        // Create new album only if it hasn't been created yet
        const albumRef = await addDoc(collection(db, "albums"), {
          uid: userId,
          name: newAlbumName,
          isPublic: newAlbumIsPublic,
          hasWatermark: newAlbumAddWatermark,
          createdAt: new Date(),
        });
        albumId = albumRef.id;
        setCurrentUploadedAlbumId(albumId);
        albumIsPublic = newAlbumIsPublic;
        albumAddWatermark = newAlbumAddWatermark;
      } else if (selectedAlbum) {
        // Fetch the selected album's settings
        const albumDoc = await getDoc(doc(db, "albums", selectedAlbum));
        if (albumDoc.exists()) {
          albumIsPublic = albumDoc.data().isPublic || false;
          albumAddWatermark = albumDoc.data().hasWatermark || false;
        }
      }

      // Fetch user info if not already loaded for watermarking
      let userInfo = currentUserInfo;
      if (albumAddWatermark && !userInfo) {
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          userInfo = userSnap.data();
        }
      }
      const userName = userInfo?.name || userInfo?.email || "User";

      // Upload all files
      for (let i = 0; i < selectedFiles.length; i++) {
        const selectedFile = selectedFiles[i];
        const photoName = photoNames[i];

        // Upload original file first
        const originalStoragePath = `gallery/${userId}/${Date.now()}-${i}-${selectedFile.name}`;
        const originalStorageRef = ref(storage, originalStoragePath);
        await uploadBytes(originalStorageRef, selectedFile);
        const originalImageUrl = await getDownloadURL(originalStorageRef);

        let displayImageUrl = originalImageUrl;
        let displayStoragePath = originalStoragePath;

        // Apply watermark if enabled at album level
        if (albumAddWatermark) {
          const watermarkedFile = await applyWatermark(selectedFile, userName);

          // Upload watermarked version for display
          const watermarkStoragePath = `gallery/${userId}/${Date.now()}-${i}-watermark-${selectedFile.name}`;
          const watermarkStorageRef = ref(storage, watermarkStoragePath);
          await uploadBytes(watermarkStorageRef, watermarkedFile);
          displayImageUrl = await getDownloadURL(watermarkStorageRef);
          displayStoragePath = watermarkStoragePath;
        }

        // Add photo to database with album-level settings
        await addDoc(collection(db, "photos"), {
          uid: userId,
          albumId: albumId,
          name: photoName,
          description: "",
          imageUrl: displayImageUrl,
          storagePath: displayStoragePath,
          originalImageUrl: originalImageUrl,
          originalStoragePath: originalStoragePath,
          hasWatermark: albumAddWatermark,
          isPublic: albumIsPublic,
          createdAt: new Date(),
        });
      }

      alert(`${selectedFiles.length} bilder uppladdad till albumet!`);
      closeUploadModal();
      fetchAlbums(userId);
    } catch (error) {
      console.error("Error uploading:", error);
      alert("Fel vid uppladdning");
    } finally {
      setUploading(false);
    }
  };

  /*--------- Handle comment ----------*/
  const handleComment = () => {
    setShowComment(true);
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

  /*--------- if gallery is not empty ----------*/
  const filterButtons = [
    { id: "Explore", label: "Explore", icon: FaGlobeAfrica },
    { id: "photos", label: "Photos", icon: Image },
    { id: "albums", label: "Albums", icon: Album },
    { id: "favorites", label: "Favorites", icon: Heart },
  ];

  return (
    <>
      <div className="sm:p-20 p-4">
        {/* ------Header----------- */}
        <div className="flex sm:flex-row flex-col justify-between gap-4 mb-8">
          <div className="grid sm:gap-5 gap-3">
            <h1 className="font-black sm:text-6xl text-3xl bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent letter-spacing-wide">
              {!isAuthenticated && activeTab === "Explore" ? "Explore" : "Min Studio"}
            </h1>
            {isAuthenticated && (
              <section className="flex gap-3 flex-wrap">
                {filterButtons.map((btn) => {
                  const Icon = btn.icon;
                  const isActive = activeTab === btn.id;
                  return (
                    <button
                      key={btn.id}
                      onClick={() => {
                        if (btn.id === "albums" && openedAlbumId && userId !== albumOwnerId) {
                          setOpenedAlbumId(null);
                          setAlbumPhotos([]);
                          setAlbumOwnerId(null);
                        }
                        setActiveTab(btn.id);
                      }}
                      className={`flex items-center gap-1 sm:gap-2 px-3 py-2 rounded-xl font-medium transition-all duration-200 cursor-pointer ${
                        isActive ? "bg-gray-900 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                      }`}>
                      <Icon size={18} />
                      {btn.label}
                    </button>
                  );
                })}
              </section>
            )}
          </div>
          {isAuthenticated && (
            <button
              onClick={handleClick}
              className="flex place-self-start sm:place-self-end items-center gap-2 bg-gradient-to-r from-neutral-700 to-neutral-800 hover:from-blue-600 hover:to-blue-700 text-white font-semibold h-fit sm:px-4 sm:py-3 px-2 py-1.5 sm:rounded-2xl rounded-xl cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/40 hover:scale-102 active:scale-95">
              <Plus size={20} />
              Ladda upp
            </button>
          )}
          {!isAuthenticated && (
            <button
              onClick={() => router.push("/sign-in")}
              className="flex place-self-start sm:place-self-end items-center gap-2 bg-gradient-to-r from-neutral-700 to-neutral-800 hover:from-blue-600 hover:to-blue-700 text-white font-semibold h-fit sm:px-4 sm:py-3 px-2 py-1 rounded-2xl cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/40 hover:scale-102 active:scale-95">
              <Plus size={20} />
              Skapa din egen
            </button>
          )}
        </div>

        {/* ----------Content Grid------------ */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <p className="text-gray-600">Laddar...</p>
          </div>
        ) : activeTab === "albums" && openedAlbumId ? (
          // Album Detail View
          <div>
            <div className="flex flex-wrap gap-3 mb-6 justify-between items-center">
              <button
                onClick={userId === albumOwnerId ? closeAlbumDetail : () => setActiveTab("Explore")}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2 cursor-pointer">
                {userId === albumOwnerId ? "← Tillbaka till album" : "← Explore more"}
              </button>
              <div className="flex items-center gap-4 flex-1">
                <div className="flex items-center gap-2 text-blue-500">
                  <MdFolder className="size-9" />
                  <h2 className="text-3xl font-bold">{openedAlbumName}</h2>
                </div>

                {/* Dropdown for small screens */}
                <div className="relative ml-auto md:hidden">
                  <button
                    onClick={() => setAlbumActionsDropdown(!albumActionsDropdown)}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                    <BsThreeDots size={24} />
                  </button>
                  {albumActionsDropdown && (
                    <div className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-max">
                      <button
                        onClick={() => {
                          downloadAlbumPhotos();
                          setAlbumActionsDropdown(false);
                        }}
                        disabled={downloadingAlbum || albumPhotos.length === 0}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed first:rounded-t-lg border-b border-gray-200">
                        {downloadingAlbum ? (
                          <>
                            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                            Laddar ner...
                          </>
                        ) : (
                          <>
                            <IoCloudDownloadSharp size={18} className="text-blue-500" />
                            Ladda ner album
                          </>
                        )}
                      </button>
                      {userId === albumOwnerId && (
                        <>
                          <button
                            onClick={() => {
                              copyAlbumLink(openedAlbumId);
                              setAlbumActionsDropdown(false);
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors flex items-center gap-2 border-b border-gray-200">
                            {copiedAlbumId === openedAlbumId ? (
                              <>✓ Länk kopierad!</>
                            ) : (
                              <>
                                <MdContentCopy size={18} className="text-green-500" />
                                Dela via länk
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => {
                              setShowDeleteConfirm(true);
                              setAlbumActionsDropdown(false);
                            }}
                            disabled={deletingAlbum}
                            className="w-full px-4 py-2 text-left hover:bg-red-50 transition-colors flex items-center gap-2 last:rounded-b-lg text-red-600 disabled:opacity-50 disabled:cursor-not-allowed">
                            {deletingAlbum ? (
                              <>
                                <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                                Tar bort...
                              </>
                            ) : (
                              <>
                                <MdDelete size={18} />
                                Ta bort album
                              </>
                            )}
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Inline buttons for large screens */}
                <div className="hidden md:flex gap-2 ml-auto">
                  <button
                    onClick={downloadAlbumPhotos}
                    disabled={downloadingAlbum || albumPhotos.length === 0}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                    {downloadingAlbum ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Laddar ner...
                      </>
                    ) : (
                      <>
                        <IoCloudDownloadSharp size={18} />
                        Ladda ner album
                      </>
                    )}
                  </button>
                  {userId === albumOwnerId && (
                    <>
                      <button
                        onClick={() => copyAlbumLink(openedAlbumId)}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 cursor-pointer">
                        {copiedAlbumId === openedAlbumId ? (
                          <>✓ Länk kopierad!</>
                        ) : (
                          <>
                            <MdContentCopy size={18} />
                            Dela via länk
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        disabled={deletingAlbum}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                        {deletingAlbum ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Tar bort...
                          </>
                        ) : (
                          <>
                            <MdDelete size={18} />
                            Ta bort album
                          </>
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Ta bort album?</h3>
                  <p className="text-gray-600 mb-6 text-sm">
                    Är du säker på att du vill ta bort detta album? Alla {albumPhotos.length} foto(n) i albumet kommer
                    att raderas permanent.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      disabled={deletingAlbum}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">
                      Avbryt
                    </button>
                    <button
                      onClick={deleteAlbum}
                      disabled={deletingAlbum}
                      className="flex-1 px-4 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                      {deletingAlbum ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Tar bort...
                        </>
                      ) : (
                        <>Ta bort permanent</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
            {albumPhotos.length === 0 ? (
              <p className="text-gray-500 text-center py-10">Inga foton i detta album ännu</p>
            ) : (
              <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
                {albumPhotos.map((photo) => (
                  <button
                    key={photo.id}
                    onClick={() => fetchPhotoUploaderInfo(photo)}
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden cursor-pointer text-left hover:opacity-90 w-full break-inside-avoid">
                    <div className="relative w-full bg-gray-100">
                      <img src={photo.imageUrl} alt={photo.name} className="w-full h-auto object-cover" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg text-gray-900">{photo.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{photo.description || "Ingen beskrivning"}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : activeTab === "albums" ? (
          <div>
            {userAlbums.length === 0 ? (
              <p className="text-gray-500 text-center py-10">Inga album ännu</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 sm:w-fit w-full gap-5">
                {/*--------- album folder icons and its stuff --------------------*/}
                {userAlbums.map((album) => (
                  <button
                    key={album.id}
                    onClick={() => fetchAlbumPhotos(album.id, album.name)}
                    className="group relative overflow-hidden rounded-2xl transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer">
                    {/* Background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />

                    {/* Card container */}
                    <div className="relative py-4 bg-white border border-gray-200 rounded-2xl h-full flex flex-col items-center justify-center">
                      {/* Album Name */}
                      <p className="font-bold text-gray-900 truncate w-full text-center text-sm group-hover:text-blue-600 transition-colors duration-300">
                        {album.name}
                      </p>
                      {/* Folder Icon */}
                      <div className="relative">
                        <MdFolder className="text-9xl text-blue-500 group-hover:text-blue-600 transition-colors duration-300" />
                        <div className="absolute inset-0 bg-blue-400 opacity-0 group-hover:opacity-20 rounded-lg blur-lg transition-opacity duration-300" />

                        {/* Photo Count */}
                        <div className="absolute top-13 left-10">
                          <div className="flex items-center gap-2 text-white text-3xl">
                            <IoIosImages />
                            <span className="text-xs font-semibold">{albumPhotoCounts[album.id] || 0}</span>
                          </div>
                        </div>
                      </div>

                      {/* Album Info */}
                      <div className="flex gap-1 text-slate-800">
                        {/* Privacy Status */}
                        <div className="flex items-center justify-center gap-2">
                          {album.isPublic ? <IoMdGlobe /> : <IoLockClosed />}
                        </div>

                        {/* Watermark Status */}
                        <div className="text-xs font-semibold">
                          <span>{album.hasWatermark ? "Stämplat" : "Ej stämplat"}</span>
                        </div>
                      </div>
                      {/* Hover effect indicator */}
                      <div className="absolute inset-0 border-2 border-blue-400 opacity-0 group-hover:opacity-100 rounded-2xl pointer-events-none transition-opacity duration-300" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          /*-------------- Image card viewer ---------------*/
          <div>
            {photos.length === 0 ? (
              <p className="text-gray-500 text-center py-10 h-[40vh]">
                {activeTab === "Explore"
                  ? "Inga offentliga foton än"
                  : activeTab === "favorites"
                    ? "Inga favoritfoton än. Börja gilla bilder for att see dem här!"
                    : "Inga foton ännu"}
              </p>
            ) : (
              <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
                {photos.map((photo) => (
                  <button
                    key={photo.id}
                    onClick={() => fetchPhotoUploaderInfo(photo)}
                    className="rounded-xl shadow-md hover:shadow-lg overflow-hidden cursor-pointer hover:opacity-90 transition-all duration-300 w-full break-inside-avoid">
                    <img src={photo.imageUrl} alt={photo.name} className="w-full h-auto object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* -----------------Photo Detail Modal----------------- */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/96 flex items-center justify-center z-50 sm:p-4 p-2"
          onClick={closePhotoDetail}>
          <div className="relative w-full sm:w-fit">
            {/* Close Button */}
            <button
              onClick={closePhotoDetail}
              className="absolute z-20 top-3 right-4 bg-amber-50 p-2 hover:bg-red-600 hover:text-white rounded-full transition-all duration-300 cursor-pointer inset-shadow-md shadow-black">
              <X size={15} />
            </button>

            <div
              className="rounded-4xl max-w-5xl max-h-[98vh] overflow-y-auto hide-scrollbar shadow-lg shadow-black"
              onClick={(e) => e.stopPropagation()}>
              {/* Modal Content */}
              <div className="relative">
                <div className="absolute z-10 top-6 left-6">
                  {/* Uploader Information */}
                  <div className="flex items-center gap-3">
                    {/* Profile Picture*/}
                    {photoUploaderInfo?.profileImage && (
                      <img
                        src={photoUploaderInfo.profileImage}
                        alt={photoUploaderInfo.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-white flex-shrink-0"
                      />
                    )}

                    {/* Text Content, Loops between photo info and uploader info */}
                    <div className="relative">
                      {/* Photo Info */}
                      <div
                        className={`transition-all duration-300 ${
                          showUploaderInfo ? "opacity-0 translate-y-[-5px]" : "opacity-100 translate-y-0"
                        }`}>
                        <h4 className="font-bold text-white text-sm truncate">{selectedPhoto?.name}</h4>
                        {selectedPhoto?.description && (
                          <p className="text-xs text-white/80 line-clamp-1">{selectedPhoto.description}</p>
                        )}
                      </div>

                      {/* Uploader Info */}
                      <div
                        className={`absolute top-0 left-0 transition-all duration-300 ${
                          showUploaderInfo ? "opacity-100 translate-y-0" : "opacity-0 translate-y-[-5px]"
                        }`}>
                        <h4 className="font-bold text-white text-sm truncate">
                          {photoUploaderInfo?.name || photoUploaderInfo?.email}
                        </h4>
                        <p className="text-xs text-white/80 truncate">{photoUploaderInfo?.email}</p>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Photo Image */}
                <div className="relative w-full rounded-xl overflow-hidden">
                  <img
                    src={selectedPhoto.imageUrl}
                    alt={selectedPhoto.name}
                    className="sm:min-h-[95vh] w-full max-h-[95vh]"
                  />
                  {/*--------- Like and comment icon ----------*/}
                  <div className="absolute">
                    <div className="relative bottom-13 left-5">
                      <div className="flex gap-5 items-center bg-black/60 backdrop-blur-md rounded-full px-2 py-1 border border-black/60 shadow-lg">
                        <button
                          onClick={() => {
                            if (isAuthenticated) {
                              toggleLike();
                            } else {
                              router.push("/sign-in");
                            }
                          }}
                          className="flex items-center gap-1 group relative">
                          {isLiked ? (
                            <Heart
                              className="text-red-600 size-5 cursor-pointer hover:scale-120 transition-all duration-300"
                              fill="currentColor"
                            />
                          ) : (
                            <FaRegHeart className="text-white size-5 group-hover:scale-120 group-hover:text-red-600 transition-all duration-200 cursor-pointer" />
                          )}
                          {likes.length > 0 && <span className="text-white text-xs font-semibold">{likes.length}</span>}
                          <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-slate-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                            Gilla
                          </span>
                        </button>
                        <button onClick={handleComment} className="flex items-center gap-1 group relative">
                          <FaCommentDots className="text-white size-5 hover:scale-120 hover:text-green-600 transition-all duration-200 cursor-pointer" />
                          {comments.length > 0 && (
                            <span className="text-white text-xs font-semibold">{comments.length}</span>
                          )}
                          <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-slate-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                            Kommentera
                          </span>
                        </button>
                        <button
                          onClick={() => {
                            if (downloadRequestStatus === null) {
                              sendDownloadRequest();
                            } else if (downloadRequestStatus === "accepted") {
                              handleDownload();
                            }
                          }}
                          disabled={downloadRequestStatus === "pending"}
                          className="group relative">
                          {downloadRequestStatus === null && (
                            <TbPhotoDown className="text-white size-5.5 hover:scale-120 hover:text-green-600 transition-all duration-200 cursor-pointer" />
                          )}
                          {downloadRequestStatus === "pending" && (
                            <LuClock12
                              className="text-white size-5 transition-all duration-200"
                              style={{ animation: "spin 2s linear infinite" }}
                            />
                          )}
                          {downloadRequestStatus === "accepted" && (
                            <IoCloudDownloadSharp className="text-white size-5.5 hover:scale-120 hover:text-blue-600 transition-all duration-200 cursor-pointer" />
                          )}
                          <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-slate-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                            {downloadRequestStatus === null && "Skicka tillstånd begäran för bilden"}
                            {downloadRequestStatus === "pending" && "Begäran väntar"}
                            {downloadRequestStatus === "accepted" && "Ladda ner"}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* ------------ Comment section -------------- */}
              {showComment && (
                <div className="grid items-center pb-5 border-r-red-700">
                  <hr className="text-white my-2 mx-30" />
                  {/* Comments list */}
                  <div className="mx-1 mb-3">
                    {comments.length === 0 ? (
                      <p className="text-white text-xs text-center py-2">Inga kommentarer än</p>
                    ) : (
                      comments.map((comment, idx) => (
                        <div key={idx} className="bg-slate-300 rounded-lg p-2 mb-2 text-black text-xs">
                          <div className="flex items-center gap-2">
                            {comment.profileImage && (
                              <img
                                src={comment.profileImage}
                                alt={comment.username}
                                className="w-8 h-8 rounded-full object-cover border-1 border-black"
                              />
                            )}
                            <div className="grid">
                              <p className="font-semibold">{comment.username}</p>
                              <p className="text-gray-900 sm:max-w-80 md:max-w-90">{comment.text}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Comment input */}
                  {isAuthenticated ? (
                    <div className="flex items-center bg-white mx-1 rounded-lg overflow-hidden">
                      <input
                        type="text"
                        placeholder="Lämna kommentar här"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && newComment.trim()) {
                            e.preventDefault();
                            addComment();
                          }
                        }}
                        className="pl-3 py-1 w-full placeholder:text-gray-400 outline-none text-black"
                      />
                      <button
                        onClick={addComment}
                        disabled={!newComment.trim()}
                        className="mr-2 text-green-600 cursor-pointer hover:scale-120 transition-all duration-200 disabled:opacity-50">
                        <FaCircleArrowUp />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => router.push("/sign-in")}
                      className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                      Logga in för att kommentera
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* -----------------Upload Modal----------------- */}
      <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileSelect} className="hidden" />

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 sm:p-4 p-1">
          <div className="bg-white rounded-2xl max-w-2xl w-full sm:max-h-[90vh] overflow-y-auto shadow-2xl p-2">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-1 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Ladda upp bild</h2>
              <button onClick={closeUploadModal} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="sm:p-6 space-y-6">
              {/* Multiple Image Previews and Names */}
              {previews.length > 0 && (
                <div className="sm:space-y-4">
                  <h3 className="font-semibold text-gray-900">Bilder att ladda upp ({previews.length})</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                    {previews.map((preview, index) => (
                      <div key={index}>
                        <div className="relative w-full h-40 bg-gray-100 overflow-hidden">
                          <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                        </div>
                        <input
                          type="text"
                          value={photoNames[index]}
                          onChange={(e) => {
                            const newNames = [...photoNames];
                            newNames[index] = e.target.value;
                            setPhotoNames(newNames);
                          }}
                          placeholder="Bildnamn"
                          disabled={uploading}
                          className="w-full px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Album Selection */}
              <div className="sm:space-y-2 space-y-1 sm:pt-6">
                <h3 className="font-semibold text-gray-900 text-center">Ange vart bilerna ska gå</h3>

                {!createNewAlbum ? (
                  <>
                    <select
                      value={selectedAlbum}
                      onChange={(e) => setSelectedAlbum(e.target.value)}
                      disabled={uploading}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50">
                      <option value="">Välj ett befintligt album</option>
                      {albums.map((album) => (
                        <option key={album.id} value={album.id}>
                          {album.name}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => setCreateNewAlbum(true)}
                      disabled={uploading}
                      className="w-full py-2 border-2 border-blue-500 text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50">
                      + Skapa nytt album
                    </button>
                  </>
                ) : (
                  <>
                    <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-2 bg-slate-100 p-3 md:px-2 md:py-2 rounded-md">
                      <input
                        type="text"
                        value={newAlbumName}
                        onChange={(e) => setNewAlbumName(e.target.value)}
                        placeholder="Ange album namn"
                        disabled={uploading}
                        className="w-full md:w-auto md:flex-1 h-fit px-3 py-2 md:py-1 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                      />

                      {/* Privacy Toggle for New Album */}
                      <div className="flex items-center sm:px-2 py-1 gap-2 sm:gap-2 rounded-lg w-fit text-sm">
                        <div
                          className={`flex sm:gap-2 gap-1 sm:p-2 p-1 rounded-2xl ${newAlbumIsPublic && "bg-blue-300"}`}>
                          <div className="flex items-center gap-1">
                            <Globe className="" />
                            <p className="font-medium text-gray-900">Offentligt</p>
                          </div>
                          <button
                            onClick={() => setNewAlbumIsPublic(!newAlbumIsPublic)}
                            disabled={uploading}
                            className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors ${
                              newAlbumIsPublic ? "bg-blue-600" : "bg-gray-300"
                            } disabled:opacity-50`}>
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                newAlbumIsPublic ? "translate-x-7" : "translate-x-1"
                              }`}
                            />
                          </button>
                        </div>
                        {/* Watermark Toggle for New Album */}
                        <div
                          className={`flex items-center rounded-2xl p-1 sm:p-2 gap-2 ${newAlbumAddWatermark && "bg-blue-300"}`}>
                          <div className="flex items-center gap-1">
                            <TbSquareHalf size={20} />
                            <p>Vattenstämpel</p>
                          </div>
                          <button
                            onClick={() => setNewAlbumAddWatermark(!newAlbumAddWatermark)}
                            disabled={uploading}
                            className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors ${
                              newAlbumAddWatermark ? "bg-blue-600" : "bg-gray-300"
                            } disabled:opacity-50`}>
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                newAlbumAddWatermark ? "translate-x-7" : "translate-x-1"
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    </section>
                    <div className="px-2">
                      <button
                        onClick={() => setCreateNewAlbum(false)}
                        disabled={uploading}
                        className="w-full py-2 border-2 border-gray-300 text-gray-600 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">
                        Avbryt album skapande
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Share Album Section - Show if album is selected */}
              {(selectedAlbum || (createNewAlbum && newAlbumName.trim())) && (
                <div className="border-t border-gray-200 sm:pt-1 sm:space-y-3">
                  <h3 className="font-semibold text-gray-900">Dela album</h3>
                  <div className="flex gap-3">
                    <button
                      onClick={handleCopyLinkAndUpload}
                      disabled={uploading || creatingAlbumForShare}
                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-100 text-blue-700 font-medium rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50">
                      {uploading || creatingAlbumForShare ? (
                        <>
                          <div className="w-4 h-4 border-2 border-blue-700 border-t-transparent rounded-full animate-spin" />
                          Laddar upp...
                        </>
                      ) : (
                        <>
                          <MdContentCopy size={18} />
                          Kopiera länk & Ladda upp
                        </>
                      )}
                    </button>
                  </div>
                  {copiedAlbumId === (selectedAlbum || newAlbumName) && (
                    <p className="text-xs text-green-600 font-semibold text-center">✓ Länk kopierad!</p>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="sm:border-t border-gray-200 sm:pt-6 flex gap-3">
                <button
                  onClick={closeUploadModal}
                  disabled={uploading}
                  className="flex-1 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">
                  Avbryt
                </button>
                <button
                  onClick={handleUpload}
                  disabled={
                    uploading ||
                    selectedFiles.length === 0 ||
                    photoNames.some((name) => !name.trim()) ||
                    (!selectedAlbum && !createNewAlbum) ||
                    (createNewAlbum && !newAlbumName.trim())
                  }
                  className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  {uploading ? "Laddar upp..." : `Ladda upp (${selectedFiles.length})`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <FooterSection />
    </>
  );
}
