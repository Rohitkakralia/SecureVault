import { useState, useEffect, useRef } from "react";
import { fetchUser } from "../actions/fetchDetails";
import { fetchUploads } from "../actions/fetchDetails";

export default function FileUpload({ useremail }) {
  const [file, setFile] = useState(null);
  const [patientName, setPatientName] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [patientDisease, setPatientDisease] = useState("");
  const [patientGender, setGenderDisease] = useState("");
  const [hash, setHash] = useState("");
  const [loading, setLoading] = useState(false);
  const [decryptedImage, setDecryptedImage] = useState(null);
  const [iv, setIv] = useState(""); // IV for current upload
  const [uploadHistory, setUploadHistory] = useState([]); // List of uploads from MongoDB
  const [filteredHistory, setFilteredHistory] = useState([]); // Filtered history based on search
  const [searchQuery, setSearchQuery] = useState(""); // Search query state
  const [searchFilter, setSearchFilter] = useState("all"); // Search filter state
  const [isModalOpen, setIsModalOpen] = useState(false); // For enlarged image view
  const [isDragging, setIsDragging] = useState(false); // For drag and drop state
  const fileInputRef = useRef(null); // Reference to the file input element

  // Function to fetch upload history from your backend (MongoDB)
  const getData = async () => {
    let u = await fetchUser(useremail);
    let images = await fetchUploads(u);
    setUploadHistory(images);
    setFilteredHistory(images); // Initialize filtered history with all images
  };
  
  useEffect(() => {
    getData();
  }, []);

  // Search function to filter the upload history
  const handleSearch = (query, filter) => {
    setSearchQuery(query);
    setSearchFilter(filter);
    
    if (!query.trim()) {
      setFilteredHistory(uploadHistory); // Reset to show all results
      return;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = uploadHistory.filter(upload => {
      if (filter === "all") {
        return (
          (upload.patientName && upload.patientName.toLowerCase().includes(lowerQuery)) ||
          (upload.patientAge && upload.patientAge.toString().includes(lowerQuery)) ||
          (upload.patientDisease && upload.patientDisease.toLowerCase().includes(lowerQuery)) ||
          (upload.patientGender && upload.patientGender.toLowerCase().includes(lowerQuery))
        );
      } else if (filter === "name") {
        return upload.patientName && upload.patientName.toLowerCase().includes(lowerQuery);
      } else if (filter === "age") {
        return upload.patientAge && upload.patientAge.toString().includes(lowerQuery);
      } else if (filter === "disease") {
        return upload.patientDisease && upload.patientDisease.toLowerCase().includes(lowerQuery);
      } else if (filter === "gender") {
        return upload.patientGender && upload.patientGender.toLowerCase().includes(lowerQuery);
      }
      return false;
    });
    
    setFilteredHistory(filtered);
  };

  const handleFileChange = (selectedFile) => {
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  // Handle file input change
  const handleInputChange = (event) => {
    handleFileChange(event.target.files[0]);
  };

  // Drag and drop handlers
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a file");
    console.log("Form Data Values:", {
      useremail,
      patientName,
      patientAge,
      patientDisease,
      patientGender,
      file
    });
    setLoading(true);
    try {
      const { encryptedData, iv } = await encryptImage(file);
      const formData = new FormData();
      formData.append("file", new Blob([encryptedData])); // Encrypted file
      formData.append("iv", iv); // IV as base64 string
      formData.append("useremail", useremail || ""); // Pass the user identifier
      formData.append("patientName", patientName || "");
      formData.append("patientAge", patientAge || "");
      formData.append("patientDisease", patientDisease || "");
      formData.append("patientGender", patientGender || "");
    
      console.log("formData:", formData.get("patientName"));
      console.log("formData:", formData.get("patientAge"));
      console.log("formData:", formData.get("patientDisease"));
      console.log("formData:", formData.get("patientGender"));
      

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Upload failed");
      const data = await response.json();
      if (data.hash) {
        setHash(data.hash);
        setIv(iv);
        // After a successful upload, re-fetch the uploads from MongoDB
        getData();
      } else {
        alert("Upload failed: Hash not found");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Upload failed");
    }
    setLoading(false);
  };

  // Decrypt the most recent upload
  const handleDecrypt = async () => {
    if (!hash) return alert("No encrypted file to decrypt");
    try {
      const response = await fetch(`https://gateway.pinata.cloud/ipfs/${hash}`);
      if (!response.ok) throw new Error("Failed to download encrypted file");
      const encryptedData = new Uint8Array(await response.arrayBuffer());
      const decryptedBlob = await decryptImage(encryptedData, iv);
      setDecryptedImage(URL.createObjectURL(decryptedBlob));
    } catch (error) {
      console.error("Decryption error:", error);
      alert("Failed to decrypt file");
    }
  };

  // Decrypt an image from upload history
  const handleDecryptHistory = async (record) => {
    try {
      const response = await fetch(`https://gateway.pinata.cloud/ipfs/${record.hash}`);
      if (!response.ok) throw new Error("Failed to download encrypted file");
      const encryptedData = new Uint8Array(await response.arrayBuffer());
      const decryptedBlob = await decryptImage(encryptedData, record.iv);
      setDecryptedImage(URL.createObjectURL(decryptedBlob));
    } catch (error) {
      console.error("Decryption error:", error);
      alert("Failed to decrypt file from history");
    }
  };

  // Hide the decrypted image
  const handleHideImage = () => {
    setDecryptedImage(null);
  };

  // Open modal for enlarged view
  const handleImageClick = () => {
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="p-4 max-w-6xl mx-auto text-center">
      <div className="flex flex-col md:gap-6">
        <div className="w-full">
          <div className="border rounded-lg shadow-md p-4 h-full">
            <h2 className="text-xl font-bold mb-4">Upload to IPFS (Encrypted)</h2>
            
            {/* Patient Information Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label htmlFor="patientName" className="block text-sm font-medium text-gray-700 mb-1">
                  Patient Name
                </label>
                <input
                  type="text"
                  id="patientName"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full text-black px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter patient name"
                />
              </div>
              
              <div>
                <label htmlFor="patientAge" className="block text-sm font-medium text-gray-700 mb-1">
                  Patient Age
                </label>
                <input
                  type="number"
                  id="patientAge"
                  value={patientAge}
                  onChange={(e) => setPatientAge(e.target.value)}
                  min="0"
                  max="150"
                  className="w-full text-black px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter patient age"
                />
              </div>
              
              <div>
                <label htmlFor="patientDisease" className="block text-sm font-medium text-gray-700 mb-1">
                  Patient Disease
                </label>
                <input
                  type="text"
                  id="patientDisease"
                  value={patientDisease}
                  onChange={(e) => setPatientDisease(e.target.value)}
                  className="w-full text-black px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter patient disease"
                />
              </div>
              <div>
                <label htmlFor="patientGender" className="block text-sm font-medium text-gray-700 mb-1">
                  Patient Gender
                </label>
                <input
                  type="text"
                  id="patientGender"
                  value={patientGender}
                  onChange={(e) => setGenderDisease(e.target.value)}
                  className="w-full text-black px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter patient Gender"
                />
              </div>
            </div>
            
            {/* Drag & Drop area */}
            <div 
              className={`border-2 ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-dashed border-gray-300'} 
                        rounded-lg p-6 text-center h-64 flex flex-col items-center justify-center cursor-pointer
                        transition-colors duration-200 mb-4`}
              onClick={() => fileInputRef.current.click()}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleInputChange}
                className="hidden"
              />
              
              <svg className="w-10 h-10 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
              </svg>
              
              <p className="text-md text-gray-600">Drag & drop your file here or <span className="text-blue-500 font-medium">browse</span></p>
              
              {file && (
                <p className="mt-2 text-sm bg-gray-100 p-1 rounded w-full truncate">
                  Selected: {file.name}
                </p>
              )}
            </div>
            
            <button
              onClick={handleUpload}
              className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400 w-full"
              disabled={loading || !file || !patientName || !patientAge || !patientDisease}
            >
              {loading ? "Uploading..." : "Upload"}
            </button>

            {hash && (
              <div className="mt-4 p-3 border rounded bg-gray-100 relative">
                <div className="mb-3">
                  <p className="font-bold">Patient Information:</p>
                  <p>Name: {patientName}</p>
                  <p>Age: {patientAge}</p>
                  <p>Disease: {patientDisease}</p>
                </div>
                <p>
                  <strong>Encrypted File Hash:</strong>
                </p>
                <p className="mb-2 break-all">
                  <strong>IPFS:</strong> {hash}
                </p>
                <p>
                  <a
                    href={`https://gateway.pinata.cloud/ipfs/${hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    View on IPFS
                  </a>
                </p>
                <button
                  onClick={handleDecrypt}
                  className="bg-green-500 text-white px-4 py-2 mt-3 rounded w-full"
                >
                  Decrypt and View
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="w-full text-black">
          <div className="border rounded-lg shadow-md p-4 h-full">
            <h2 className="text-xl font-bold mb-4">Upload History</h2>
            
            {/* Search Bar */}
            <div className="mb-4 bg-gray-50 p-3 rounded-lg">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    className="w-full p-2 pl-10 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Search patient records..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value, searchFilter)}
                  />
                  <svg 
                    className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                
                <select
                  className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchFilter}
                  onChange={(e) => handleSearch(searchQuery, e.target.value)}
                >
                  <option value="all">All Fields</option>
                  <option value="name">Patient Name</option>
                  <option value="age">Age</option>
                  <option value="disease">Disease</option>
                  <option value="gender">Gender</option>
                </select>
              </div>
            </div>
            
            {filteredHistory.length === 0 ? (
              <div className="border rounded-lg p-8 text-center h-64 flex flex-col items-center justify-center bg-gray-50">
                {uploadHistory.length === 0 ? (
                  <>
                    <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    <p className="text-gray-500">No uploads yet</p>
                  </>
                ) : (
                  <>
                    <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                    <p className="text-gray-500">No matching results found</p>
                    <button 
                      onClick={() => handleSearch("", "all")} 
                      className="mt-2 text-blue-500 hover:underline"
                    >
                      Clear search
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="overflow-y-auto max-h-96">
                {filteredHistory.map((upload, index) => (
                  <div key={upload._id || index} className="border p-3 rounded mb-3 bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="mb-2">
                      <p className="text-sm font-medium text-black">
                        <strong>File:</strong> {upload.fileName}
                      </p>
                      <p className="text-xs text-gray-600">
                        {new Date(upload.uploadDate).toLocaleString()}
                      </p>
                    </div>
                    
                    <div className="bg-white p-2 rounded mb-2 text-black">
                      <h3 className="text-sm font-bold mb-1">Patient Information</h3>
                      <div className="grid grid-cols-2 gap-1 text-xs">
                        <p><strong>Name:</strong> {upload.patientName || 'N/A'}</p>
                        <p><strong>Age:</strong> {upload.patientAge || 'N/A'}</p>
                        <p><strong>Gender:</strong> {upload.patientGender || 'N/A'}</p>
                        <p><strong>Disease:</strong> {upload.patientDisease || 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between text-black items-center mt-2">
                      <a
                        href={`https://gateway.pinata.cloud/ipfs/${upload.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline text-xs"
                      >
                        View on IPFS
                      </a>
                      <button
                        onClick={() => handleDecryptHistory(upload)}
                        className="bg-green-500 text-white px-2 py-1 rounded text-xs"
                      >
                        Decrypt & View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New section - Decrypted image display at the bottom */}
      {decryptedImage && (
        <div className="mt-6 p-4 border rounded-lg shadow-md bg-white relative">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-bold">Decrypted Image</h2>
            <button
              onClick={handleHideImage}
              className="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center"
              title="Hide Image"
            >
              &times;
            </button>
          </div>
          
          <div className="flex justify-center">
            <img
              src={decryptedImage}
              alt="Decrypted"
              className="max-h-96 rounded cursor-pointer transition-transform duration-200 hover:scale-105"
              onClick={handleImageClick}
            />
          </div>
        </div>
      )}

      {/* Modal for enlarged image view */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
          <div className="relative max-w-3xl max-h-full">
            <button
              onClick={handleCloseModal}
              className="absolute top-0 right-0 m-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center"
              title="Close Enlarged View"
            >
              &times;
            </button>
            <img
              src={decryptedImage}
              alt="Enlarged Decrypted"
              className="max-w-full max-h-full rounded"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Encrypt the file using AES-CBC
async function encryptImage(file) {
  const iv = crypto.getRandomValues(new Uint8Array(16)); // 16-byte IV
  const keyBuffer = new TextEncoder().encode("0123456789abcdef0123456789abcdef"); // 32-byte key
  const key = await crypto.subtle.importKey("raw", keyBuffer, { name: "AES-CBC" }, false, ["encrypt"]);
  const fileBuffer = await file.arrayBuffer();
  const encryptedData = await crypto.subtle.encrypt({ name: "AES-CBC", iv }, key, fileBuffer);
  return { encryptedData: new Uint8Array(encryptedData), iv: Buffer.from(iv).toString("base64") };
}

// Decrypt the file using AES-CBC
async function decryptImage(encryptedData, iv) {
  const ivBuffer = new Uint8Array(Buffer.from(iv, "base64"));
  const keyBuffer = new TextEncoder().encode("0123456789abcdef0123456789abcdef");
  const key = await crypto.subtle.importKey("raw", keyBuffer, { name: "AES-CBC" }, false, ["decrypt"]);
  const decryptedData = await crypto.subtle.decrypt({ name: "AES-CBC", iv: ivBuffer }, key, encryptedData);
  return new Blob([decryptedData]);
}