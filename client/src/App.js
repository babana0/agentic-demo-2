import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";

function App() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [claimForm, setClaimForm] = useState(null);
  const [pdrmReport, setPdrmReport] = useState(null);
  const [images, setImages] = useState([]);
  const [status, setStatus] = useState("");
  const [useProduction, setUseProduction] = useState(true);
  const [zoomedImage, setZoomedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const devUrl = "https://sem89.app.n8n.cloud/webhook-test/new-claim/submit";
  const productionUrl = "https://sem89.app.n8n.cloud/webhook/new-claim/submit";
  const uploadUrl = useProduction ? productionUrl : devUrl;

  // 👇 Blob URL map for better preview performance
  const imageBlobUrls = useMemo(() => {
    return images.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
  }, [images]);

  // 🧹 Clean up Blob URLs
  useEffect(() => {
    return () => {
      imageBlobUrls.forEach(({ url }) => URL.revokeObjectURL(url));
      if (zoomedImage) URL.revokeObjectURL(zoomedImage);
    };
  }, [imageBlobUrls, zoomedImage]);

  const handleChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const imageFiles = selectedFiles.filter((file) => file.type.startsWith("image/"));
    setImages((prev) => [...prev, ...imageFiles]);
    setStatus("");
  };

  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (isUploading) return;

    if (!name) {
      setStatus("⚠️ Please enter your name.");
      return;
    }
    if (!email) {
      setStatus("⚠️ Please enter your email.");
      return;
    }
    if (images.length === 0) {
      setStatus("⚠️ Please select at least one image.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    if (claimForm) formData.append("claim_form", claimForm);
    if (pdrmReport) formData.append("pdrm_report", pdrmReport);
    images.forEach((img) => formData.append("images", img));

    try {
      setIsUploading(true);
      setStatus("⏳ Uploading...");
      await axios.post(uploadUrl, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setStatus("✅ Upload successful!");
      setName("");
      setEmail("");
      setClaimForm(null);
      setPdrmReport(null);
      setImages([]); // ✅ Clear on success
    } catch (err) {
      console.error(err);
      setStatus(`❌ Upload failed: ${err?.response?.data?.message || err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const renderFilePreview = (file) => {
    if (file && file.type.startsWith("image/")) {
      const blobUrl = URL.createObjectURL(file);
      return (
        <img
          src={blobUrl}
          alt="preview"
          style={{ width: "100%", maxHeight: "140px", objectFit: "contain", borderRadius: "8px" }}
          onClick={() => setZoomedImage(blobUrl)}
        />
      );
    } else {
      return <p style={{ fontSize: "0.85rem", color: "#475569" }}>{file?.name}</p>;
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* ... unchanged UI ... */}

        {images.length > 0 && (
          <div style={styles.grid}>
            {imageBlobUrls.map(({ file, url }, index) => (
              <div key={index} style={styles.card}>
                <div onClick={() => setZoomedImage(url)} style={{ cursor: "zoom-in" }}>
                  <img src={url} alt={`preview-${index}`} style={styles.image} />
                </div>
                <p style={styles.filename}>{file.name}</p>
                <button onClick={() => handleRemoveImage(index)} style={styles.removeBtn}>
                  ✖
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={handleUpload}
          style={{
            ...styles.uploadBtn,
            backgroundColor: name && email && !isUploading ? "#3b82f6" : "#cbd5e1",
            cursor: name && email && !isUploading ? "pointer" : "not-allowed",
          }}
          disabled={!name || !email || isUploading}
        >
          🚀 {isUploading ? "Uploading..." : "Submit Claim"}
        </button>

        {status && (
          <p
            style={{
              ...styles.status,
              color: status.includes("fail") || status.includes("❌") || status.includes("⚠️") ? "#dc2626" : "#16a34a",
            }}
          >
            {status}
          </p>
        )}
      </div>

      {zoomedImage && (
        <div style={styles.modal} onClick={() => setZoomedImage(null)}>
          <img src={zoomedImage} alt="zoomed" style={styles.modalImage} />
        </div>
      )}
    </div>
  );
}
