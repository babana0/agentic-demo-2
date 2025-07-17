import React, { useState } from "react";
import axios from "axios";

function App() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [claimForm, setClaimForm] = useState(null);
  const [pdrmReport, setPdrmReport] = useState(null);
  const [status, setStatus] = useState("");
  const [useProduction, setUseProduction] = useState(true);
  const [zoomedImage, setZoomedImage] = useState(null);

  const devUrl = "https://sem89.app.n8n.cloud/webhook-test/new-claim/submit";
  const productionUrl = "https://sem89.app.n8n.cloud/webhook/new-claim/submit";
  const uploadUrl = useProduction ? productionUrl : devUrl;

  const handleUpload = async () => {
    if (!name) {
      setStatus("⚠️ Please enter your name.");
      return;
    }
    if (!email) {
      setStatus("⚠️ Please enter your email.");
      return;
    }
    if (!claimForm) {
      setStatus("⚠️ Please upload the Claim Form.");
      return;
    }
    if (!pdrmReport) {
      setStatus("⚠️ Please upload the PDRM Report.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("claimForm", claimForm);
    formData.append("pdrmReport", pdrmReport);

    try {
      setStatus("⏳ Uploading...");
      await axios.post(uploadUrl, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setStatus("✅ Upload successful!");
      setName("");
      setEmail("");
      setClaimForm(null);
      setPdrmReport(null);
    } catch (err) {
      setStatus("❌ Upload failed.");
    }
  };

  const renderFilePreview = (file) =>
    file && file.type.startsWith("image/") ? (
      <img
        src={URL.createObjectURL(file)}
        alt="preview"
        style={{ width: "100%", maxHeight: "140px", objectFit: "contain", borderRadius: "8px" }}
        onClick={() => setZoomedImage(URL.createObjectURL(file))}
      />
    ) : (
      <p style={{ fontSize: "0.85rem", color: "#475569" }}>{file.name}</p>
    );

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Toggle Live/Test */}
        <div style={styles.toggleWrapper}>
          <span style={styles.toggleLabel}>{useProduction ? "Live" : "Test"}</span>
          <div
            style={{
              ...styles.toggle,
              justifyContent: useProduction ? "flex-start" : "flex-end",
              backgroundColor: useProduction ? "#4ade80" : "#f87171",
            }}
            onClick={() => setUseProduction((prev) => !prev)}
          >
            <div style={styles.toggleThumb}></div>
          </div>
        </div>

        <h1 style={styles.title}>📤 Submit Your Claim</h1>

        {/* Name */}
        <div style={styles.section}>
          <label style={styles.label}>Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
            style={styles.input}
          />
        </div>

        {/* Email */}
        <div style={styles.section}>
          <label style={styles.label}>Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={styles.input}
          />
        </div>

        {/* Claim Form Upload */}
        <div style={styles.section}>
          <label style={styles.label}>Upload Claim Form</label>
          <input
            type="file"
            accept=".pdf,image/*"
            onChange={(e) => setClaimForm(e.target.files[0])}
            style={styles.fileInput}
          />
          {claimForm && <div style={{ marginTop: "0.5rem" }}>{renderFilePreview(claimForm)}</div>}
        </div>

        {/* PDRM Report Upload */}
        <div style={styles.section}>
          <label style={styles.label}>Upload PDRM Report</label>
          <input
            type="file"
            accept=".pdf,image/*"
            onChange={(e) => setPdrmReport(e.target.files[0])}
            style={styles.fileInput}
          />
          {pdrmReport && <div style={{ marginTop: "0.5rem" }}>{renderFilePreview(pdrmReport)}</div>}
        </div>

        {/* Submit */}
        <button
          onClick={handleUpload}
          style={{
            ...styles.uploadBtn,
            backgroundColor: name && email && claimForm && pdrmReport ? "#3b82f6" : "#cbd5e1",
            cursor: name && email && claimForm && pdrmReport ? "pointer" : "not-allowed",
          }}
          disabled={!name || !email || !claimForm || !pdrmReport}
        >
          🚀 Submit Claim
        </button>

        {/* Status */}
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

      {/* Zoom Modal */}
      {zoomedImage && (
        <div style={styles.modal} onClick={() => setZoomedImage(null)}>
          <img src={zoomedImage} alt="zoomed" style={styles.modalImage} />
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f8fafc",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: "4rem 1rem",
    fontFamily: "system-ui, sans-serif",
  },
  container: {
    position: "relative",
    width: "100%",
    maxWidth: "720px",
    backgroundColor: "#ffffff",
    padding: "2rem",
    borderRadius: "16px",
    boxShadow: "0 8px 20px rgba(0, 0, 0, 0.05)",
    border: "1px solid #e2e8f0",
  },
  toggleWrapper: {
    position: "absolute",
    top: "1rem",
    right: "1rem",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  toggleLabel: {
    fontSize: "0.9rem",
    fontWeight: 600,
    color: "#1e293b",
  },
  toggle: {
    width: "50px",
    height: "26px",
    borderRadius: "999px",
    display: "flex",
    alignItems: "center",
    padding: "2px",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
    boxSizing: "border-box",
  },
  toggleThumb: {
    width: "22px",
    height: "22px",
    backgroundColor: "#ffffff",
    borderRadius: "50%",
    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
    transition: "transform 0.3s ease",
  },
  title: {
    fontSize: "1.75rem",
    fontWeight: "700",
    marginBottom: "2rem",
    color: "#0f172a",
  },
  section: {
    marginBottom: "1.5rem",
  },
  label: {
    display: "block",
    fontSize: "1rem",
    fontWeight: "600",
    marginBottom: "0.5rem",
    color: "#334155",
  },
  input: {
    width: "100%",
    padding: "0.75rem 1rem",
    fontSize: "1rem",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    outline: "none",
    boxSizing: "border-box",
  },
  fileInput: {
    display: "block",
    fontSize: "0.95rem",
  },
  uploadBtn: {
    padding: "0.75rem 1.5rem",
    border: "none",
    color: "#fff",
    fontSize: "1rem",
    fontWeight: "600",
    borderRadius: "8px",
    transition: "background-color 0.3s ease",
    width: "100%",
  },
  status: {
    marginTop: "1rem",
    fontSize: "0.95rem",
    fontWeight: "500",
    textAlign: "center",
  },
  modal: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(0,0,0,0.75)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    cursor: "zoom-out",
  },
  modalImage: {
    maxWidth: "90vw",
    maxHeight: "90vh",
    borderRadius: "12px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
  },
};

export default App;
