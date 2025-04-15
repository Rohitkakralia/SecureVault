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
    const filtered = uploadHistory.filter((upload) => {
      if (filter === "all") {
        return (
          (upload.patientName &&
            upload.patientName.toLowerCase().includes(lowerQuery)) ||
          (upload.patientAge &&
            upload.patientAge.toString().includes(lowerQuery)) ||
          (upload.patientDisease &&
            upload.patientDisease.toLowerCase().includes(lowerQuery)) ||
          (upload.patientGender &&
            upload.patientGender.toLowerCase().includes(lowerQuery))
        );
      } else if (filter === "name") {
        return (
          upload.patientName &&
          upload.patientName.toLowerCase().includes(lowerQuery)
        );
      } else if (filter === "age") {
        return (
          upload.patientAge && upload.patientAge.toString().includes(lowerQuery)
        );
      } else if (filter === "disease") {
        return (
          upload.patientDisease &&
          upload.patientDisease.toLowerCase().includes(lowerQuery)
        );
      } else if (filter === "gender") {
        return (
          upload.patientGender &&
          upload.patientGender.toLowerCase().includes(lowerQuery)
        );
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
      file,
      fileType: file.type // Store file type
    });
    setLoading(true);
    try {
      const { encryptedData, iv } = await encryptImage(file);
      const encryptedFile = new File(
        [encryptedData],
        file.name,
        { type: file.type }
      );

      const formData = new FormData();
      formData.append("file", encryptedFile);
      formData.append("iv", iv);
      formData.append("useremail", useremail || "");
      formData.append("patientName", patientName || "");
      formData.append("patientAge", patientAge || "");
      formData.append("patientDisease", patientDisease || "");
      formData.append("patientGender", patientGender || "");
      formData.append("fileType", file.type); // Store original file type

      console.log("formData:", formData.get("patientName"));
      console.log("formData:", formData.get("patientAge"));
      console.log("formData:", formData.get("patientDisease"));
      console.log("formData:", formData.get("patientGender"));
      console.log("formData fileType:", formData.get("fileType"));

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
      
      // Get the file type for the current upload
      const fileType = file ? file.type : 'application/octet-stream';
      
      const decryptedBlob = await decryptImage(encryptedData, iv, fileType);
      
      setDecryptedImage({
        url: URL.createObjectURL(decryptedBlob),
        type: fileType
      });
    } catch (error) {
      console.error("Decryption error:", error);
      alert("Failed to decrypt file");
    }
  };

  // Decrypt an image from upload history
  const handleDecryptHistory = async (record) => {
    try {
      const response = await fetch(
        `https://gateway.pinata.cloud/ipfs/${record.hash}`
      );
      if (!response.ok) throw new Error("Failed to download encrypted file");
      const encryptedData = new Uint8Array(await response.arrayBuffer());
      
      // Use the fileType from the record or default to a generic type
      const fileType = record.fileType || 'application/octet-stream';
      
      const decryptedBlob = await decryptImage(encryptedData, record.iv, fileType);
      
      // Create an object URL from the blob
      const url = URL.createObjectURL(decryptedBlob);
      
      setDecryptedImage({
        url: url,
        type: fileType,
        name: record.fileName || "Decrypted File"
      });
      
      // Automatically download the file if it's not an image
      if (!fileType.startsWith('image/')) {
        const link = document.createElement('a');
        link.href = url;
        link.download = record.fileName || "decrypted-file";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error("Decryption error:", error);
      alert("Failed to decrypt file from history");
    }
  };
  
  // Add this function to your component
  const handleDeleteHistory = async (upload) => {
    if (!upload || !upload._id) {
      console.error("Cannot delete record: Invalid upload data or missing ID");
      return;
    }

    // Confirm deletion with the user
    if (
      !confirm(
        `Are you sure you want to delete this record for patient ${upload.patientName}?`
      )
    ) {
      return;
    }

    try {
      // Show loading state
      setLoading(true);
      const imageId = upload._id; // Get the ID of the image to delete
      console.log("Deleting record with ID:", imageId);
      // Make API call to delete the record from the database
      const response = await fetch("/api/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete record");
      }

      // Update the local state by removing the deleted record
      setUploadHistory((prevHistory) =>
        prevHistory.filter((record) => record._id !== upload._id)
      );

      // Also update filtered history if search is active
      setFilteredHistory((prevFiltered) =>
        prevFiltered.filter((record) => record._id !== upload._id)
      );

      // Show success message
      alert("Record deleted successfully");
    } catch (error) {
      console.error("Error deleting record:", error);
      alert(`Failed to delete record: ${error.message}`);
    } finally {
      setLoading(false);
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
    <div className="bg-gray-50 min-h-screen py-6">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-center mb-8 text-gray-800">
          Medical Record Management
        </h1>

        <div className="grid grid-cols-1 lg:grid-row-2 gap-6">
          {/* Upload Section */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-blue-600 px-6 py-4">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  ></path>
                </svg>
                Upload Medical Record
              </h2>
            </div>

            <div className="p-6">
              {/* Patient Information Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label
                    htmlFor="patientName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Patient Name
                  </label>
                  <input
                    type="text"
                    id="patientName"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter patient name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="patientAge"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Patient Age
                  </label>
                  <input
                    type="number"
                    id="patientAge"
                    value={patientAge}
                    onChange={(e) => setPatientAge(e.target.value)}
                    min="0"
                    max="150"
                    className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter patient age"
                  />
                </div>

                <div>
                  <label
                    htmlFor="patientDisease"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Patient Disease
                  </label>
                  <input
                    type="text"
                    id="patientDisease"
                    value={patientDisease}
                    onChange={(e) => setPatientDisease(e.target.value)}
                    className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter patient disease"
                  />
                </div>

                <div>
                  <label
                    htmlFor="patientGender"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Patient Gender
                  </label>
                  <select
                    id="patientGender"
                    value={patientGender}
                    onChange={(e) => setGenderDisease(e.target.value)}
                    className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="" disabled >
                      Select gender
                    </option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* File Upload Area */}
              <div
                className={`border-2 ${
                  isDragging
                    ? "border-blue-500 bg-blue-50"
                    : "border-dashed border-gray-300"
                } 
                          rounded-lg p-6 text-center h-48 flex flex-col items-center justify-center cursor-pointer
                          transition-all duration-300 hover:bg-gray-50 mb-6`}
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

                <div className="bg-blue-100 p-3 rounded-full mb-3">
                  <svg
                    className="w-8 h-8 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    ></path>
                  </svg>
                </div>

                <p className="text-md text-gray-600 mb-1">
                  Drag & drop your medical record here
                </p>
                <p className="text-sm text-gray-500">
                  or{" "}
                  <span className="text-blue-600 font-medium">
                    browse files
                  </span>
                </p>

                {file && (
                  <div className="mt-3 bg-blue-50 p-2 rounded-lg max-w-full">
                    <p className="text-sm text-blue-700 font-medium truncate">
                      {file.name}
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={handleUpload}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-3 rounded-lg disabled:bg-gray-400 w-full transition-colors duration-200 flex items-center justify-center"
                disabled={
                  loading ||
                  !file ||
                  !patientName ||
                  !patientAge ||
                  !patientDisease
                }
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Uploading...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12"
                      ></path>
                    </svg>
                    Upload & Encrypt
                  </>
                )}
              </button>

              {/* Upload Success Section */}
              {hash && (
                <div className="mt-6 p-4 border rounded-xl bg-blue-50 border-blue-200 text-black">
                  <div className="flex items-center mb-3 text-blue-600">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                    <span className="font-semibold">Upload Successful</span>
                  </div>

                  <div className="bg-white p-3 rounded-lg mb-3 shadow-sm">
                    <p className="font-semibold mb-2">Patient Information:</p>
                    <div className="grid grid-cols-2 gap-1 text-sm">
                      <p>
                        <strong>Name:</strong> {patientName}
                      </p>
                      <p>
                        <strong>Age:</strong> {patientAge}
                      </p>
                      <p>
                        <strong>Disease:</strong> {patientDisease}
                      </p>
                      <p>
                        <strong>Gender:</strong> {patientGender || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="font-semibold text-sm mb-1">
                      Encrypted File Hash:
                    </p>
                    <p className="text-xs font-mono bg-gray-100 p-2 rounded-lg break-all border border-gray-200">
                      {hash}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <a
                      href={`https://gateway.pinata.cloud/ipfs/${hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
                    >
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        ></path>
                      </svg>
                      View on IPFS
                    </a>

                    <button
                      onClick={handleDecrypt}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors duration-200"
                    >
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                        ></path>
                      </svg>
                      Decrypt & View
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* History Section */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-indigo-600 px-6 py-4">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                Upload History
              </h2>
            </div>

            <div className="p-6">
              {/* Search Bar */}
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-grow">
                    <input
                      type="text"
                      className="w-full text-black p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Search patient records..."
                      value={searchQuery}
                      onChange={(e) =>
                        handleSearch(e.target.value, searchFilter)
                      }
                    />
                    <svg
                      className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>

                  <select
                    className="text-black p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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

              {/* Records List */}
              {filteredHistory.length === 0 ? (
                <div className="rounded-xl p-8 text-center h-64 flex flex-col items-center justify-center bg-gray-50">
                  {uploadHistory.length === 0 ? (
                    <>
                      <div className="bg-gray-100 p-4 rounded-full mb-3">
                        <svg
                          className="w-10 h-10 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          ></path>
                        </svg>
                      </div>
                      <p className="text-gray-500 font-medium">
                        No uploads yet
                      </p>
                      <p className="text-gray-400 text-sm mt-1">
                        Patient records will appear here after upload
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="bg-gray-100 p-4 rounded-full mb-3">
                        <svg
                          className="w-10 h-10 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                          ></path>
                        </svg>
                      </div>
                      <p className="text-gray-600 font-medium">
                        No matching results found
                      </p>
                      <button
                        onClick={() => handleSearch("", "all")}
                        className="mt-3 text-indigo-600 hover:text-indigo-800 hover:underline flex items-center"
                      >
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          ></path>
                        </svg>
                        Clear search
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <div className="overflow-y-auto max-h-96 pr-1">
                  {filteredHistory.map((upload, index) => (
  <div
    key={upload._id || index}
    className="border border-gray-200 rounded-xl mb-3 overflow-hidden"
  >
    <div className="bg-gray-50 p-3 border-b border-gray-200">
      <div className="flex justify-between items-center">
        <span className="font-medium text-gray-700">
          {upload.fileName}
        </span>
        <span className="text-xs text-gray-500">
          {new Date(upload.uploadDate).toLocaleString()}
        </span>
      </div>
    </div>

    <div className="p-3">
      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
        <div className="bg-gray-50 p-2 rounded-lg">
          <span className="text-xs text-gray-500">
            Patient Name
          </span>
          <p className="font-medium text-black">
            {upload.patientName || "N/A"}
          </p>
        </div>
        <div className="bg-gray-50 p-2 rounded-lg">
          <span className="text-xs text-gray-500">Age</span>
          <p className="font-medium text-black">
            {upload.patientAge || "N/A"}
          </p>
        </div>
        <div className="bg-gray-50 p-2 rounded-lg">
          <span className="text-xs text-gray-500">
            Disease
          </span>
          <p className="font-medium text-black">
            {upload.patientDisease || "N/A"}
          </p>
        </div>
        <div className="bg-gray-50 p-2 rounded-lg">
          <span className="text-xs text-gray-500">
            Gender
          </span>
          <p className="font-medium text-black">
            {upload.patientGender || "N/A"}
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center mt-2">
        <a
          href={`https://gateway.pinata.cloud/ipfs/${upload.hash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center"
        >
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            ></path>
          </svg>
          View on IPFS
        </a>
        <button
          onClick={() => handleDecryptHistory(upload)}
          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm font-medium flex items-center transition-colors duration-200"
        >
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
            ></path>
          </svg>
          Decrypt
        </button>
        <button
          onClick={() => handleDeleteHistory(upload)}
          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm font-medium flex items-center transition-colors duration-200"
        >
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m2 0v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6h16zM10 11v6M14 11v6"
            />
          </svg>
          Delete
        </button>
      </div>
    </div>
  </div>
))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Decrypted Image Section */}
       {/* Decrypted File Section */}
{decryptedImage && (
  <div className="mt-6 bg-white rounded-xl shadow-lg overflow-hidden">
    <div className="bg-green-600 px-6 py-4 flex justify-between items-center">
      <h2 className="text-xl font-semibold text-white flex items-center">
        <svg
          className="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          ></path>
        </svg>
        Decrypted Medical Record: {decryptedImage.name}
      </h2>
      <div className="flex space-x-2">
        <a
          href={decryptedImage.url}
          download={decryptedImage.name || "download"}
          className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full p-2 flex items-center justify-center transition-colors duration-200"
          title="Download File"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            ></path>
          </svg>
        </a>
        <button
          onClick={handleHideImage}
          className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full p-2 flex items-center justify-center transition-colors duration-200"
          title="Hide File"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>
      </div>
    </div>

    <div className="p-6 flex justify-center">
      {decryptedImage.type.startsWith('image/') ? (
        <img
          src={decryptedImage.url}
          alt="Decrypted Medical Record"
          className="max-h-96 rounded-lg shadow-md cursor-pointer transition-all duration-300 hover:scale-105"
          onClick={handleImageClick}
        />
      ) : decryptedImage.type === 'application/pdf' ? (
        <div className="w-full h-96 rounded-lg shadow-md border border-gray-200">
          <object
            data={decryptedImage.url}
            type="application/pdf"
            width="100%"
            height="100%"
            className="rounded-lg"
          >
            <p>
              PDF cannot be displayed. Please
              <a href={decryptedImage.url} download={decryptedImage.name || "download"} className="text-blue-600 hover:underline"> download </a>
              to view.
            </p>
          </object>
        </div>
      ) : (
        <div className="text-center bg-gray-50 p-8 rounded-lg border border-gray-200 shadow-sm w-full">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">{decryptedImage.name}</h3>
          <p className="text-gray-600 mb-4">File type: {decryptedImage.type}</p>
          <a
            href={decryptedImage.url}
            download={decryptedImage.name || "download"}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200 inline-flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
            </svg>
            Download File
          </a>
        </div>
      )}
    </div>
  </div>
)}

{/* Modal for enlarged image */}
{isModalOpen && decryptedImage && decryptedImage.type.startsWith('image/') && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50 p-4">
    <div className="relative max-w-4xl w-full">
      <button
        onClick={handleCloseModal}
        className="absolute -top-12 right-0 bg-white text-black rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-200 transition-colors duration-200"
        title="Close Enlarged View"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M6 18L18 6M6 6l12 12"
          ></path>
        </svg>
      </button>
      <img
        src={decryptedImage.url}
        alt="Enlarged Medical Record"
        className="max-w-full max-h-[85vh] rounded-lg shadow-2xl mx-auto"
      />
    </div>
  </div>
)}
      </div>
    </div>
  );
}

// Encrypt the file using AES-CBC
async function encryptImage(file) {
  const iv = crypto.getRandomValues(new Uint8Array(16)); // 16-byte IV
  const keyBuffer = new TextEncoder().encode(
    "0123456789abcdef0123456789abcdef"
  ); // 32-byte key
  const key = await crypto.subtle.importKey(
    "raw",
    keyBuffer,
    { name: "AES-CBC" },
    false,
    ["encrypt"]
  );
  const fileBuffer = await file.arrayBuffer();
  const encryptedData = await crypto.subtle.encrypt(
    { name: "AES-CBC", iv },
    key,
    fileBuffer
  );
  return {
    encryptedData: new Uint8Array(encryptedData),
    iv: Buffer.from(iv).toString("base64"),
  };
}

// Decrypt the file using AES-CBC
async function decryptImage(encryptedData, iv, fileType = 'application/octet-stream') {
  const ivBuffer = new Uint8Array(Buffer.from(iv, "base64"));
  const keyBuffer = new TextEncoder().encode(
    "0123456789abcdef0123456789abcdef"
  );
  const key = await crypto.subtle.importKey(
    "raw",
    keyBuffer,
    { name: "AES-CBC" },
    false,
    ["decrypt"]
  );
  const decryptedData = await crypto.subtle.decrypt(
    { name: "AES-CBC", iv: ivBuffer },
    key,
    encryptedData
  );
  return new Blob([decryptedData], { type: fileType });
}
