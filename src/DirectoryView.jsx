import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import DirectoryHeader from "./components/DirectoryHeader";
import CreateDirectoryModal from "./components/CreateDirectoryModal";
import RenameModal from "./components/RenameModal";
import DirectoryList from "./components/DirectoryList";
import ShareModal from "./components/ShareModal";
import DetailsPopup from "./components/DetailsPopup";
import ImportFromDrive from "./components/ImportFromDrive";
import { Alert, AlertTitle, AlertDescription } from "./components/lightswind/alert";
import UploadToast from "./components/UploadToast";
import ContextMenu from "./components/ContextMenu";
import { 
  Upload,
  FolderPlus, 
  FilePlus, 
  AlertTriangle, 
  Info, 
  X,
  Folder,
  FileText,
  Image as ImageIcon,
  Video,
  Archive,
  FileCode,
  File,
  Search,
  Grid,
  List,
  ChevronDown,
  Home,
  Download,
  MoreVertical
} from "lucide-react";

// Helper function to format file sizes
const formatSize = (bytes) => {
  const KB = 1024;
  const MB = KB * 1024;
  const GB = MB * 1024;
  if (bytes >= GB) return (bytes / GB).toFixed(2) + " GB";
  if (bytes >= MB) return (bytes / MB).toFixed(2) + " MB";
  if (bytes >= KB) return (bytes / KB).toFixed() + " KB";
  return bytes + " B";
};

function DirectoryView() {
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const { dirId } = useParams();
  const navigate = useNavigate();

  const { user } = useAuth();

  // Displayed directory name
  const [directoryName, setDirectoryName] = useState("My Drive");
  const [path, setPath] = useState([]);

  // Lists of items
  const [directoriesList, setDirectoriesList] = useState([]);
  const [filesList, setFilesList] = useState([]);

  // Error state
  const [errorMessage, setErrorMessage] = useState("");

  // Modal states
  const [showCreateDirModal, setShowCreateDirModal] = useState(false);
  const [newDirname, setNewDirname] = useState("New Folder");

  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameType, setRenameType] = useState(null);
  const [renameId, setRenameId] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [renameVersion, setRenameVersion] = useState(undefined);
  const [isRenaming, setIsRenaming] = useState(false);
  const [extensionError, setExtensionError] = useState("");
  const [originalRenameValue, setOriginalRenameValue] = useState("");

  // Share modal state
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareResourceType, setShareResourceType] = useState(null);
  const [shareResourceId, setShareResourceId] = useState(null);
  const [shareResourceName, setShareResourceName] = useState("");

  // Details modal state
  const [detailsItem, setDetailsItem] = useState(null);

  // Uploading states
  const fileInputRef = useRef(null);
  const [uploadQueue, setUploadQueue] = useState([]);
  const [allUploads, setAllUploads] = useState([]); // Track full batch for the toast
  const uploadQueueRef = useRef([]);
  const [uploadXhrMap, setUploadXhrMap] = useState({});
  const [progressMap, setProgressMap] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [abortControllers, setAbortControllers] = useState({});

  // Storage refresh ref
  const refreshStorageRef = useRef(null);

  // Toast state
  const [toast, setToast] = useState({ show: false, message: "", type: "info" });
  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "info" }), 3000);
  };

  // Context menu
  const [activeContextMenu, setActiveContextMenu] = useState(null);
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });

  // Search, view mode, and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("list"); // "list" or "grid"
  const [sortBy, setSortBy] = useState("name"); // "name", "date", "size"

  // Details functions
  const openDetailsPopup = (item) => {
    console.log("Opening details for:", item);
    setDetailsItem(item);
    setActiveContextMenu(null);
  };

  const closeDetailsPopup = () => setDetailsItem(null);

  /**
   * Utility: handle fetch errors
   */
  async function handleFetchErrors(response) {
    if (!response.ok) {
      let errMsg = `Request failed with status ${response.status}`;
      try {
        const data = await response.json();
        if (data.error) errMsg = data.error;
      } catch (_) {
        // If JSON parsing fails, default errMsg stays
      }
      throw new Error(errMsg);
    }
    return response;
  }

  /**
   * Fetch directory contents
   */
  async function getDirectoryItems() {
    setErrorMessage("");
    try {
      const response = await fetch(`${BASE_URL}/directory/${dirId || ""}`, {
        credentials: "include",
      });

      if (response.status === 401) {
        navigate("/login");
        return;
      }

      await handleFetchErrors(response);
      const data = await response.json();

      setDirectoryName(dirId ? data.name : "My Drive");
      setPath(data.path || []);
      setDirectoriesList([...data.directories].reverse());
      setFilesList([...data.files].reverse());
    } catch (error) {
      setErrorMessage(error.message);
      showToast(error.message, "error");
    }
  }

  useEffect(() => {
    getDirectoryItems();
    setActiveContextMenu(null);
  }, [dirId]);

  /**
   * Decide file icon - Safely handle item object or string
   */
  function getFileIcon(item) {
    const filename = typeof item === "string" ? item : item?.name || "";
    const isDir = typeof item === "object" ? item?.isDirectory : false;

    if (isDir) {
      return <Folder className="w-5 h-5" style={{ color: '#66B2D6' }} />;
    }

    if (!filename || typeof filename !== 'string') {
      return <File className="w-5 h-5" style={{ color: '#A3C5D9' }} />;
    }

    const ext = filename.split(".").pop().toLowerCase();
    switch (ext) {
      case "pdf":
        return <FileText className="w-5 h-5" style={{ color: '#DC2626' }} />;
      case "png":
      case "jpg":
      case "jpeg":
      case "gif":
      case "webp":
        return <ImageIcon className="w-5 h-5" style={{ color: '#9333EA' }} />;
      case "mp4":
      case "mov":
      case "avi":
      case "webm":
        return <Video className="w-5 h-5" style={{ color: '#DC2626' }} />;
      case "zip":
      case "rar":
      case "tar":
      case "gz":
        return <Archive className="w-5 h-5" style={{ color: '#F97316' }} />;
      case "js":
      case "jsx":
      case "ts":
      case "tsx":
      case "html":
      case "css":
      case "py":
      case "java":
      case "json":
        return <FileCode className="w-5 h-5" style={{ color: '#10B981' }} />;
      default:
        return <File className="w-5 h-5" style={{ color: '#A3C5D9' }} />;
    }
  }

  /**
   * Click row to open directory or file - Handle both (type, id) or (item)
   */
  function handleRowClick(typeOrItem, idIfType) {
    const type = typeof typeOrItem === "string" ? typeOrItem : (typeOrItem?.isDirectory ? "directory" : "file");
    const id = idIfType || typeOrItem?.id;

    if (!id) return;

    console.log("handleRowClick - status:", user?.subscriptionStatus);
    if (type === "directory") {
      navigate(`/directory/${id}`);
    } else {
    if (["halted", "expired", "paused"].includes(user?.subscriptionStatus?.toLowerCase())) {
      showToast("Your account is restricted. Downloads are disabled.", "warning");
      return;
    }
      
      // Fixed: Fetch the URL via JSON first to ensure auth cookies are sent cross-origin
      fetch(`${BASE_URL}/file/${id}?json=true`, { credentials: "include" })
        .then(res => res.json())
        .then(data => {
          if (data.url) {
            window.open(data.url, "_blank");
          } else if (data.error) {
            showToast(data.error, "error");
            if (data.status === 401) navigate("/login");
          }
        })
        .catch(err => {
          console.error("Error opening file:", err);
          showToast("Failed to open file", "error");
        });
    }
  }

  /**
   * Handle Share
   */
  function handleShare(type, id, name) {
    setShareResourceType(type);
    setShareResourceId(id);
    setShareResourceName(name);
    setShowShareModal(true);
    setActiveContextMenu(null);
  }

  /**
   * Handle Import from Drive
   */
  // Import state
  const [isImporting, setIsImporting] = useState(false);

  /**
   * Handle Import from Drive
   */
  async function handleDriveFileImport(file, token) {
    const tempId = `import-${Date.now()}-${Math.random()}`;
    const importItem = {
      id: tempId,
      name: file.name,
      size: file.size || 0,
      isUploading: true,
      isImport: true, // Mark as import for potential logical differences
      createdAt: new Date().toISOString(),
    };

    try {
      console.log("Importing file from Drive:", file);
      
      // Add to upload UI
      setAllUploads((prev) => [importItem, ...prev]);
      setProgressMap((prev) => ({ ...prev, [tempId]: 0 }));
      setIsUploading(true);

      // Simulate progress since we don't have real progress for server-side import
      const progressInterval = setInterval(() => {
        setProgressMap((prev) => {
          const currentProgress = prev[tempId] || 0;
          if (currentProgress < 90) {
            return { ...prev, [tempId]: currentProgress + Math.random() * 10 };
          }
          return prev;
        });
      }, 1000);

      const response = await fetch(`${BASE_URL}/import/google-drive`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          fileId: file.id,
          accessToken: token,
          parentDirId: dirId,
        }),
      });

      clearInterval(progressInterval);

      if (response.status === 401) {
        navigate("/login");
        return;
      }

      await handleFetchErrors(response);
      const data = await response.json();
      console.log("Import success:", data);
      
      // Complete progress
      setProgressMap((prev) => ({ ...prev, [tempId]: 100 }));
      
      // Refresh directory items
      getDirectoryItems();
      if (refreshStorageRef.current) {
        refreshStorageRef.current();
      }

      // Cleanup toast after short delay if no other uploads
      setTimeout(() => {
        if (uploadQueueRef.current.length === 0) {
          setIsUploading(false);
          setAllUploads((prev) => prev.filter(item => item.id !== tempId));
        }
      }, 3000);
      
    } catch (error) {
      console.error("Import from Drive failed:", error);
      setErrorMessage("Failed to import file from Google Drive: " + error.message);
      showToast("Failed to import from Drive: " + error.message, "error");
      // Cleanup on error
      setAllUploads((prev) => prev.filter(item => item.id !== tempId));
    } finally {
      // isUploading will be handled by the timeout or processQueue
    }
  }

  /**
   * S3 DIRECT UPLOAD - Step 1: Initiate upload
   */
  async function initiateUpload(file, parentDirId) {
    try {
      const response = await fetch(`${BASE_URL}/file/uploads/initiate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: file.name,
          size: file.size,
          contentType: file.type || "application/octet-stream",
          parentDirId: parentDirId || undefined,
        }),
      });

      if (response.status === 401) {
        navigate("/login");
        throw new Error("Unauthorized");
      }

      await handleFetchErrors(response);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to initiate upload:", error);
      throw error;
    }
  }

  /**
   * S3 DIRECT UPLOAD - Step 2: Upload to S3
   */
  async function uploadToS3(uploadUrl, file, fileId, onProgress) {
    const xhr = new XMLHttpRequest();

    setUploadXhrMap((prev) => ({ ...prev, [fileId]: xhr }));

    try {
      return new Promise((resolve, reject) => {
        xhr.upload.addEventListener("progress", (evt) => {
          if (evt.lengthComputable) {
            const progress = (evt.loaded / evt.total) * 100;
            onProgress(progress);
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`S3 upload failed with status ${xhr.status}`));
          }
        });

        xhr.addEventListener("error", () => {
          reject(new Error("S3 upload failed due to network error"));
        });

        xhr.addEventListener("abort", () => {
          reject(new Error("Upload cancelled"));
        });

        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader(
          "Content-Type",
          file.type || "application/octet-stream"
        );
        xhr.send(file);
      });
    } catch (error) {
      throw error;
    } finally {
      setUploadXhrMap((prev) => {
        const copy = { ...prev };
        delete copy[fileId];
        return copy;
      });
    }
  }

  /**
   * S3 DIRECT UPLOAD - Step 3: Complete upload
   */
  async function completeUpload(fileId) {
    try {
      const response = await fetch(`${BASE_URL}/file/uploads/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          fileId: fileId,
        }),
      });

      if (response.status === 401) {
        navigate("/login");
        throw new Error("Unauthorized");
      }

      await handleFetchErrors(response);
      return await response.json();
    } catch (error) {
      console.error("Failed to complete upload:", error);
      throw error;
    }
  }

  /**
   * Select multiple files
   */
  function handleFileSelect(e) {
    if (["paused", "halted", "expired"].includes(user?.subscriptionStatus?.toLowerCase())) {
      showToast("Restricted access: Cannot upload files.", "warning");
      e.target.value = "";
      return;
    }
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;

    console.log("Selected files:", selectedFiles);

    const newItems = selectedFiles.map((file) => {
      const tempId = `temp-${Date.now()}-${Math.random()}`;
      return {
        file,
        name: file.name,
        size: file.size,
        id: tempId,
        isUploading: true,
        createdAt: new Date().toISOString(),
      };
    });

    setFilesList((prev) => [...newItems, ...prev]);
    setAllUploads((prev) => [...newItems, ...prev]);

    newItems.forEach((item) => {
      setProgressMap((prev) => ({ ...prev, [item.id]: 0 }));
    });

    setUploadQueue((prev) => [...prev, ...newItems]);
    uploadQueueRef.current = [...uploadQueueRef.current, ...newItems];

    e.target.value = "";

    if (!isUploading) {
      setIsUploading(true);
      processUploadQueue();
    }
  }

  /**
   * Process upload queue with S3 direct upload
   */
  async function processUploadQueue() {
    if (uploadQueueRef.current.length === 0) {
      setIsUploading(false);
      setUploadQueue([]);
      // Reset allUploads after a delay to allow success state to be visible
      setTimeout(() => {
        setAllUploads([]);
        setProgressMap({}); // Global cleanup of progress map
        getDirectoryItems();
        if (refreshStorageRef.current) {
          refreshStorageRef.current();
        }
      }, 3000);
      return;
    }

    const currentItem = uploadQueueRef.current[0];
    uploadQueueRef.current = uploadQueueRef.current.slice(1);
    setUploadQueue((prev) => prev.slice(1));
    // Don't remove from allUploads yet; toast uses it for full context

    const tempId = currentItem.id;

    try {
      console.log(`Initiating upload for: ${currentItem.name}`);
      const { fileId, uploadUrl } = await initiateUpload(
        currentItem.file,
        dirId
      );

      setFilesList((prev) =>
        prev.map((f) => (f.id === tempId ? { ...f, realFileId: fileId } : f))
      );

      console.log(`Uploading to S3: ${currentItem.name}`);
      await uploadToS3(uploadUrl, currentItem.file, fileId, (progress) => {
        setProgressMap((prev) => ({ ...prev, [tempId]: progress }));
      });

      console.log(`Completing upload: ${currentItem.name}`);
      await completeUpload(fileId);

      console.log(`Successfully uploaded: ${currentItem.name}`);

      processUploadQueue();
    } catch (error) {
      console.error(`Upload failed for ${currentItem.name}:`, error);

      setFilesList((prev) =>
        prev.filter(
          (f) => f.id !== tempId && f.realFileId !== currentItem.realFileId
        )
      );

      setProgressMap((prev) => ({ ...prev, [tempId]: 0 }));

      setErrorMessage(
        `Upload failed for ${currentItem.name}: ${error.message}`
      );
      showToast(`Upload failed: ${error.message}`, "error");

      processUploadQueue();
    }
  }

  /**
   * Cancel an in-progress upload
   */
  async function handleCancelUpload(fileId) {
    const xhr = uploadXhrMap[fileId];
    if (xhr) {
      xhr.abort();
    }

    try {
      const fileItem = filesList.find(
        (f) => f.id === fileId || f.realFileId === fileId
      );
      const realId =
        fileItem?.realFileId ||
        (fileId.toString().startsWith("temp-") ? null : fileId);

      if (realId) {
        console.log(`Notifying server to cancel upload for fileId: ${realId}`);
        fetch(`${BASE_URL}/file/uploads/cancel`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ fileId: realId }),
        }).catch((err) =>
          console.error("Failed to notify server of cancellation:", err)
        );
      }
    } catch (error) {
      console.error("Error in cancel logic:", error);
    }

    uploadQueueRef.current = uploadQueueRef.current.filter(
      (item) => item.id !== fileId && item.realFileId !== fileId
    );

    setUploadQueue((prev) =>
      prev.filter((item) => item.id !== fileId && item.realFileId !== fileId)
    );

    setFilesList((prev) =>
      prev.filter((f) => f.id !== fileId && f.realFileId !== fileId)
    );

    setAllUploads((prev) =>
      prev.filter((item) => item.id !== fileId && item.realFileId !== fileId)
    );

    setProgressMap((prev) => {
      const { [fileId]: _, ...rest } = prev;
      return rest;
    });

    setUploadXhrMap((prev) => {
      const copy = { ...prev };
      delete copy[fileId];
      return copy;
    });

    console.log(`Upload cancelled for fileId: ${fileId}`);
  }

  /**
   * Delete a file/directory
   */
  /**
   * Delete a file/directory
   */
  async function handleDeleteFile(id) {
    if (["paused", "halted", "expired"].includes(user?.subscriptionStatus?.toLowerCase())) {
        showToast("Restricted access: Cannot delete files.", "warning");
        return;
    }

    setToast({ show: true, message: "Deleting file...", type: "loading" });
    setErrorMessage("");

    try {
      const response = await fetch(`${BASE_URL}/file/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      await handleFetchErrors(response);
      
      // Update UI immediately (optimistic update could be done here, but we re-fetch)
      await getDirectoryItems();
      
      if (refreshStorageRef.current) {
        refreshStorageRef.current();
      }
      showToast("File deleted successfully", "success");
    } catch (error) {
      setErrorMessage(error.message);
      showToast(`Failed to delete file: ${error.message}`, "error");
    }
  }

  async function handleDeleteDirectory(id) {
    if (["paused", "halted", "expired"].includes(user?.subscriptionStatus?.toLowerCase())) {
        showToast("Restricted access: Cannot delete folders.", "warning");
        return;
    }

    setToast({ show: true, message: "Deleting folder...", type: "loading" });
    setErrorMessage("");

    try {
      const response = await fetch(`${BASE_URL}/directory/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      await handleFetchErrors(response);
      
      await getDirectoryItems();
      
      if (refreshStorageRef.current) {
        refreshStorageRef.current();
      }
      showToast("Folder deleted successfully", "success");
    } catch (error) {
      setErrorMessage(error.message);
      showToast(`Failed to delete folder: ${error.message}`, "error");
    }
  }

  /**
   * Create a directory
   */
  async function handleCreateDirectory(e) {
    e.preventDefault();
    if (["paused", "halted", "expired"].includes(user?.subscriptionStatus?.toLowerCase())) {
      showToast("Restricted access: Cannot create directories.", "warning");
      return;
    }
    setErrorMessage("");
    try {
      const response = await fetch(`${BASE_URL}/directory/${dirId || ""}`, {
        method: "POST",
        headers: {
          dirname: newDirname,
        },
        credentials: "include",
      });
      await handleFetchErrors(response);
      setNewDirname("New Folder");
      setShowCreateDirModal(false);
      getDirectoryItems();
    } catch (error) {
      setErrorMessage(error.message);
      showToast(error.message, "error");
    }
  }

  /**
   * Rename
   */
  function openRenameModal(type, id, currentName, version) {
    setRenameType(type);
    setRenameId(id);
    setRenameValue(currentName);
    setOriginalRenameValue(currentName);
    setRenameVersion(version);
    setExtensionError("");
    setShowRenameModal(true);
  }

  async function handleRenameSubmit(e) {
    e.preventDefault();
    setErrorMessage("");
    setIsRenaming(true);
    try {
      const url =
        renameType === "file"
          ? `${BASE_URL}/file/${renameId}`
          : `${BASE_URL}/directory/${renameId}`;
      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          renameType === "file"
            ? { newFilename: renameValue, version: renameVersion }
            : { newDirName: renameValue }
        ),
        credentials: "include",
      });

      if (response.status === 409) {
          showToast("Conflict: File modified by someone else. Refreshing...", "error");
          await getDirectoryItems();
          setShowRenameModal(false);
          return;
      }

      await handleFetchErrors(response);

      setShowRenameModal(false);
      setRenameValue("");
      setRenameType(null);
      setRenameId(null);
      setRenameVersion(undefined);
      getDirectoryItems();
    } catch (error) {
      setErrorMessage(error.message);
      showToast(error.message, "error");
    } finally {
      setIsRenaming(false);
    }
  }

  // Validate file extension when renaming files
  useEffect(() => {
    if (!showRenameModal || renameType !== "file" || !originalRenameValue || !renameValue) {
      setExtensionError("");
      return;
    }

    const originalExt = originalRenameValue.includes('.') ? originalRenameValue.split('.').pop().toLowerCase() : '';
    const newExt = renameValue.includes('.') ? renameValue.split('.').pop().toLowerCase() : '';

    if (originalExt && !newExt) {
      setExtensionError("File extension is required. Please keep the original extension.");
    } else if (originalExt && newExt && originalExt !== newExt) {
      setExtensionError(`Extension cannot be changed. Please keep '.${originalExt}' extension.`);
    } else {
      setExtensionError("");
    }
  }, [renameValue, originalRenameValue, renameType, showRenameModal]);

  /**
   * Context Menu
   */
  function handleContextMenu(e, id) {
    e.stopPropagation();
    e.preventDefault();
    const clickX = e.clientX;
    const clickY = e.clientY;

    if (activeContextMenu === id) {
      setActiveContextMenu(null);
    } else {
      setActiveContextMenu(id);
      setContextMenuPos({ x: clickX - 110, y: clickY });
    }
  }

  useEffect(() => {
    function handleDocumentClick() {
      setActiveContextMenu(null);
    }
    document.addEventListener("click", handleDocumentClick);
    return () => document.removeEventListener("click", handleDocumentClick);
  }, []);

  // Combine, filter, and sort items
  const combinedItems = (() => {
    // Combine directories and files
    let items = [
      ...directoriesList.map((d) => ({ ...d, isDirectory: true })),
      ...filesList.map((f) => ({ ...f, isDirectory: false })),
    ];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter((item) => {
        const name = item?.name || "";
        return typeof name === 'string' && name.toLowerCase().includes(query);
      });
    }

    // Sort items
    items.sort((a, b) => {
      // Always show directories first
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;

      // Then sort by selected criteria
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "date":
          return new Date(b.updatedAt) - new Date(a.updatedAt);
        case "size":
          return (b.size || 0) - (a.size || 0);
        default:
          return 0;
      }
    });

    return items;
  })();

  return (
    <div className="min-h-screen pt-16">


      {/* Removed isImporting overlay to use unified UploadToast UI */}

      <DirectoryHeader
        directoryName={directoryName}
        path={path}
        disabled={
          errorMessage ===
          "Directory not found or you do not have access to it!"
        }
        onStorageUpdate={(refreshFn) => {
          refreshStorageRef.current = refreshFn;
        }}
        userName={user?.name || "Guest User"}
        userEmail={user?.email || "guest@example.com"}
        userPicture={user?.picture || ""}
        userRole={user?.role || "User"}
        subscriptionId={user?.subscriptionId}
        subscriptionStatus={user?.subscriptionStatus || "active"}
      />

      {/* SUBSCRIPTION ALERTS */}
      {/* 1. PAUSED */}
      {user?.subscriptionStatus?.toLowerCase() === "paused" && (
        <div className="mx-6 mt-6 p-6 rounded-2xl shadow-medium animate-fadeIn" style={{ backgroundColor: '#FFF3CD', border: '2px solid #FDB827' }}>
           <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left" style={{ color: '#856404' }}>
             <div className="p-4 rounded-2xl" style={{ backgroundColor: '#FDB827' }}>
               <AlertTriangle className="w-10 h-10 text-white" />
             </div>
             <div>
               <h2 className="text-2xl font-bold" style={{ color: '#2C3E50' }}>Account Paused</h2>
               <p className="text-sm mt-2" style={{ color: '#856404' }}>
                 Administrator has paused your account. Access is restricted.
               </p>
             </div>
           </div>
        </div>
      )}

      {/* 2. PENDING (Grace Period) */}
      {user?.subscriptionStatus?.toLowerCase() === "pending" && (
        <div className="mx-6 mt-6 p-6 bg-yellow-50 border-2 border-yellow-400 rounded-xl shadow-md">
           <div className="flex flex-col sm:flex-row items-center gap-5 text-yellow-900 text-center sm:text-left">
             <div className="p-4 bg-yellow-100 rounded-2xl">
                <Info className="w-10 h-10 text-yellow-600 animate-pulse" />
             </div>
             <div className="flex-1">
               <h2 className="text-2xl font-bold">Payment Failed</h2>
               <p className="text-sm text-yellow-800 mt-2">
                 We couldn't process your renewal. You are in a grace period, but please update your payment method to avoid suspension.
               </p>
               <button 
                  onClick={() => navigate("/subscription")}
                  className="mt-3 px-4 py-2 bg-yellow-600 text-white rounded-lg font-bold hover:bg-yellow-700"
               >
                 Retry Payment
               </button>
             </div>
           </div>
        </div>
      )}

      {/* 3. HALTED / EXPIRED (Hard Block) */}
      {["halted", "expired"].includes(user?.subscriptionStatus?.toLowerCase()) && (
        <div className="mx-6 mt-6 p-6 bg-red-50 border-2 border-red-400 rounded-xl shadow-md">
           <div className="flex flex-col sm:flex-row items-center gap-5 text-red-900 text-center sm:text-left">
             <div className="p-4 bg-red-100 rounded-2xl">
                <X className="w-10 h-10 text-red-600" />
             </div>
             <div className="flex-1">
               <h2 className="text-2xl font-bold">Access Halted</h2>
               <p className="text-sm text-red-800 mt-2">
                 Your subscription has expired or payment failed repeatedly. Downloads are blocked.
               </p>
               <button 
                  onClick={() => navigate("/subscription")}
                  className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700"
               >
                 Fix Subscription
               </button>
             </div>
           </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        id="file-upload"
        type="file"
        style={{ display: "none" }}
        multiple
        onChange={handleFileSelect}
      />

      {/* Upload Section with 3 Buttons */}
      <div className="max-w-7xl mx-auto px-6 pt-8 pb-8">
        <div className="bg-white rounded-2xl border-2 border-dashed p-8 text-center shadow-soft transition-all duration-300 hover:shadow-medium" style={{ borderColor: '#A7DDE9' }}>
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#E6FAF5' }}>
              <Upload className="w-8 h-8" style={{ color: '#66B2D6' }} />
            </div>
            <h2 className="text-xl font-bold mb-1" style={{ color: '#2C3E50' }}>
              Upload Files or Create Directory
            </h2>
            <p className="text-sm" style={{ color: '#000000' }}>
              Drag and drop files here, or click to select files
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-center gap-3 md:gap-4">
            {/* Upload Files Button */}
            {/* Upload Button */}
            <div className="relative group/btn w-full md:w-auto">
              <button
                onClick={() => {
                  if (["paused", "halted", "expired"].includes(user?.subscriptionStatus?.toLowerCase())) {
                    showToast("Restricted: Uploads disabled.", "warning");
                    return;
                  }
                  fileInputRef.current.click();
                }}
                disabled={errorMessage === "Directory not found or you do not have access to it!" || isRenaming}
                className={`w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3.5 text-white rounded-xl transition-all duration-300 font-bold text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed ${
                  ["paused", "halted", "expired"].includes(user?.subscriptionStatus?.toLowerCase()) 
                  ? "bg-slate-300 cursor-not-allowed" 
                  : "bg-button hover:bg-button-hover"
                }`}
              >
                <Upload className="w-4 h-4" />
                Upload Files {["paused", "halted", "expired"].includes(user?.subscriptionStatus?.toLowerCase()) && "⚠️"}
              </button>
              {["paused", "halted", "expired"].includes(user?.subscriptionStatus?.toLowerCase()) && (
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded-lg opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap pointer-events-none flex items-center gap-1 shadow-xl z-50">
                  <AlertTriangle className="text-amber-400 w-3 h-3" />
                  Access Restricted ⚠️
                </div>
              )}
            </div>

            {/* Create Directory Button */}
            <div className="relative group/btn w-full md:w-auto">
              <button
                onClick={() => {
                  if (["paused", "halted", "expired"].includes(user?.subscriptionStatus?.toLowerCase())) {
                    showToast("Restricted: Directory creation disabled.", "warning");
                    return;
                  }
                  setShowCreateDirModal(true);
                }}
                disabled={errorMessage === "Directory not found or you do not have access to it!" || isRenaming}
                className={`w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3.5 text-white rounded-xl transition-all duration-300 font-bold text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed ${
                  ["paused", "halted", "expired"].includes(user?.subscriptionStatus?.toLowerCase()) 
                  ? "bg-slate-300 cursor-not-allowed" 
                  : "bg-accent hover:bg-accent/90"
                }`}
              >
                <FolderPlus className="w-4 h-4" />
                Create Directory {["paused", "halted", "expired"].includes(user?.subscriptionStatus?.toLowerCase()) && "⚠️"}
              </button>
              {["paused", "halted", "expired"].includes(user?.subscriptionStatus?.toLowerCase()) && (
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded-lg opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap pointer-events-none flex items-center gap-1 shadow-xl z-50">
                  <AlertTriangle className="text-amber-400 w-3 h-3" />
                  Access Restricted ⚠️
                </div>
              )}
            </div>

            {/* Import from Drive Button */}
            <div className="relative group/btn w-full md:w-auto">
              <div
                className="w-full"
                onClick={() => {
                  if (["paused", "halted", "expired"].includes(user?.subscriptionStatus?.toLowerCase())) {
                    showToast("Restricted: Import disabled.", "warning");
                  }
                }}
              >
                <ImportFromDrive
                  onFilesSelected={handleDriveFileImport}
                  disabled={["paused", "halted", "expired"].includes(user?.subscriptionStatus?.toLowerCase()) || isRenaming}
                  className={`w-full flex items-center justify-center gap-2 px-6 py-3.5 text-text-main border-2 border-border rounded-xl shadow-sm transition-all duration-300 font-bold text-sm ${
                    user?.subscriptionStatus?.toLowerCase() === "paused" || isRenaming
                      ? "bg-slate-100 cursor-not-allowed opacity-50 grayscale pointer-events-none"
                      : "bg-white hover:bg-secondary hover:border-primary/30 hover:shadow-lg hover:-translate-y-0.5"
                  }`}
                />
              </div>
              {user?.subscriptionStatus?.toLowerCase() === "paused" && (
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded-lg opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap pointer-events-none flex items-center gap-1 shadow-xl z-50">
                  <AlertTriangle className="text-amber-400 w-3 h-3" />
                  Paused: Imports Disabled ⚠️
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Search, View Toggle, and Filter Controls */}
        <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-primary/50" />
            </div>
            <input
              type="text"
              placeholder="Search files and folders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-card border-2 border-border rounded-xl transition-all duration-300 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 text-text-main placeholder:text-muted"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted hover:text-text-main transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* View Toggle Button */}
          <button
            onClick={() => setViewMode(viewMode === "list" ? "grid" : "list")}
            className="flex items-center justify-center gap-2 px-5 py-3.5 bg-card border-2 border-border rounded-xl font-bold text-sm transition-all duration-300 hover:border-primary/30 hover:bg-secondary text-text-main shadow-sm hover:shadow-md"
          >
            {viewMode === "list" ? (
              <>
                <Grid className="w-5 h-5 text-primary" />
                Grid View
              </>
            ) : (
              <>
                <List className="w-5 h-5 text-primary" />
                List View
              </>
            )}
          </button>

          {/* Sort Filter Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-5 py-3.5 bg-card border-2 border-border rounded-xl font-bold text-sm transition-all duration-300 hover:border-primary/30 hover:bg-secondary text-text-main appearance-none pr-12 cursor-pointer shadow-sm hover:shadow-md outline-none focus:border-primary"
            >
              <option value="name">Sort by Name</option>
              <option value="date">Sort by Date</option>
              <option value="size">Sort by Size</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
              <ChevronDown className="w-5 h-5 text-muted" />
            </div>
          </div>
        </div>

        {/* Breadcrumb Navigation */}
        <div className="mt-4 flex items-center text-sm text-gray-600">
          {/* Home Icon */}
          <button
            onClick={() => navigate("/")}
            className="hover:text-black transition-colors"
          >
            <Home className="w-4 h-4" />
          </button>

          {/* Path Segments */}
          {path && path.length > 0 ? (
            path.map((dir, index) => (
              <span key={dir._id} className="flex items-center">
                <span className="mx-2 text-gray-400">›</span>
                <button
                  onClick={() => navigate(`/directory/${dir._id}`)}
                  className="hover:text-black transition-colors"
                >
                  {index === 0 ? "My Drive" : dir.name}
                </button>
              </span>
            ))
          ) : null}

          {/* Current Directory */}
          {directoryName && (
            <>
              <span className="mx-2 text-gray-400">›</span>
              <span className="text-gray-900 font-medium">
                {directoryName}
              </span>
            </>
          )}

          {/* Show "My Drive" when at root */}
          {!directoryName && (!path || path.length === 0) && (
            <>
              <span className="mx-2 text-gray-400">›</span>
              <span className="text-gray-900 font-medium">My Drive</span>
            </>
          )}
        </div>
      </div>

      {showCreateDirModal && (
        <CreateDirectoryModal
          newDirname={newDirname}
          setNewDirname={setNewDirname}
          onClose={() => setShowCreateDirModal(false)}
          onCreateDirectory={handleCreateDirectory}
        />
      )}

      {showRenameModal && (
        <RenameModal
          renameType={renameType}
          renameValue={renameValue}
          setRenameValue={setRenameValue}
          onClose={() => setShowRenameModal(false)}
          onRenameSubmit={handleRenameSubmit}
          extensionError={extensionError}
          isProcessing={isRenaming}
        />
      )}

      {showShareModal && (
        <ShareModal
          resourceType={shareResourceType}
          resourceId={shareResourceId}
          resourceName={shareResourceName}
          onClose={() => {
            setShowShareModal(false);
            setShareResourceType(null);
            setShareResourceId(null);
            setShareResourceName("");
          }}
        />
      )}

      {detailsItem && (
        <DetailsPopup
          item={detailsItem}
          onClose={closeDetailsPopup}
          BASE_URL={BASE_URL}
          handleShare={handleShare}
          openDetailsPopup={openDetailsPopup} 
          subscriptionStatus={user?.subscriptionStatus}
          showToast={showToast}
        />
      )}

      <div className="max-w-7xl mx-auto px-6 pb-8">
        {combinedItems.length === 0 ? (
          errorMessage ===
          "Directory not found or you do not have access to it!" ? (
            <p className="text-center text-gray-500 py-12">
              Directory not found or you do not have access to it!
            </p>
          ) : (
            <p className="text-center text-gray-500 py-12">
              This folder is empty. Upload files or create a folder to see some
              data.
            </p>
          )
        ) : viewMode === "grid" ? (
          // Grid View
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 mt-8">
            {combinedItems.map((item) => (
              <div
                key={item.id}
                className="glass-card group flex flex-col justify-between overflow-hidden relative"
                onClick={() =>
                  !(activeContextMenu || isUploading) && handleRowClick(item)
                }
                onContextMenu={(e) => handleContextMenu(e, item.id)}
              >
                <div className="p-5 flex-1 flex flex-col">
                  {/* Top Row: Icon and Actions */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-secondary transition-transform duration-300 group-hover:scale-110 group-hover:bg-primary/10">
                        {getFileIcon(item)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold tracking-widest text-primary uppercase">
                          {item.isDirectory ? "Folder" : (item.name && typeof item.name === 'string' ? item.name.split('.').pop()?.toUpperCase() || 'FILE' : 'FILE')}
                        </span>
                        <h3 
                          className="text-sm font-bold text-text-main truncate max-w-[140px]" 
                          title={item.name}
                        >
                          {item.name}
                        </h3>
                      </div>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isRenaming) handleContextMenu(e, item.id);
                      }}
                      disabled={isRenaming}
                      className="p-2 rounded-xl hover:bg-secondary text-muted hover:text-primary transition-all active:scale-95"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Body: Stats */}
                  <div className="space-y-3 mt-auto">
                    <div className="flex justify-between items-center bg-background/50 p-2 rounded-lg">
                      <span className="text-[11px] font-semibold text-muted uppercase tracking-tighter">Size</span>
                      <span className="text-xs font-bold text-text-main">
                        {item.isDirectory ? `${item.fileCount || 0} items` : formatSize(item.size)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center bg-background/50 p-2 rounded-lg">
                      <span className="text-[11px] font-semibold text-muted uppercase tracking-tighter">Modified</span>
                      <span className="text-xs font-bold text-text-main">
                        {new Date(item.updatedAt || item.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions Footer */}
                <div className="flex border-t border-border/50 bg-secondary/30">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openDetailsPopup(item);
                    }}
                    className="flex-1 py-3.5 text-xs font-bold flex items-center justify-center gap-2 hover:bg-white hover:text-primary transition-all text-text-main border-r border-border/50"
                  >
                    <Info className="w-4 h-4" />
                    Details
                  </button>
                  
                  {!item.isDirectory ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const statusStr = String(user?.subscriptionStatus || "").toLowerCase().trim();
                        if (["halted", "expired", "paused"].includes(statusStr)) {
                          showToast("Access Restricted: Your subscription is currently paused.", "warning");
                          return;
                        }
                        window.location.href = `${BASE_URL}/file/${item.id}?action=download`;
                      }}
                      className="flex-1 py-3.5 text-xs font-bold flex items-center justify-center gap-2 hover:bg-white hover:text-button transition-all text-text-main"
                    >
                      <Download className="w-4 h-4" />
                      Get File
                    </button>
                  ) : (
                    <div className="flex-1 bg-secondary/10"></div>
                  )}
                </div>

                {/* Context menu for grid view */}
                {activeContextMenu === item.id && (
                  <ContextMenu
                    item={item}
                    contextMenuPos={contextMenuPos}
                    isUploadingItem={item.id.toString().startsWith("temp-")}
                    handleCancelUpload={handleCancelUpload}
                    handleDeleteFile={handleDeleteFile}
                    handleDeleteDirectory={handleDeleteDirectory}
                    openRenameModal={openRenameModal}
                    handleShare={handleShare}
                    openDetailsPopup={openDetailsPopup}
                    BASE_URL={BASE_URL}
                    subscriptionStatus={user?.subscriptionStatus}
                    showToast={showToast}
                  />
                )}
              </div>
            ))}
          </div>
        ) : (
          // List View
          <DirectoryList
            items={combinedItems}
            handleRowClick={handleRowClick}
            activeContextMenu={activeContextMenu}
            subscriptionStatus={user?.subscriptionStatus}
            contextMenuPos={contextMenuPos}
            handleContextMenu={handleContextMenu}
            getFileIcon={getFileIcon}
            isUploading={isUploading}
            progressMap={progressMap}
            handleCancelUpload={handleCancelUpload}
            handleDeleteFile={handleDeleteFile}
            handleDeleteDirectory={handleDeleteDirectory}
            openRenameModal={openRenameModal}
            openDetailsPopup={openDetailsPopup}
            handleShare={handleShare}
            BASE_URL={BASE_URL}
            showToast={showToast}
          />
        )}
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-24 right-6 z-[100] max-w-sm w-full md:w-[380px]">
           <Alert 
             variant={toast.type === "error" ? "destructive" : toast.type === "success" ? "success" : toast.type === "warning" ? "warning" : "info"}
             withIcon
             dismissible
             duration={3000}
             onDismiss={() => setToast({ ...toast, show: false })}
             className="shadow-2xl bg-white/95 backdrop-blur-md border-gray-100"
           >
             <AlertDescription className="font-semibold">
               {toast.message}

             </AlertDescription>
           </Alert>
        </div>
      )}

      {/* Upload Progress Toast */}
      <UploadToast
        uploadQueue={allUploads}
        progressMap={progressMap}
        isUploading={isUploading}
        onCancel={handleCancelUpload}
      />
    </div>
  );
}

export default DirectoryView;
