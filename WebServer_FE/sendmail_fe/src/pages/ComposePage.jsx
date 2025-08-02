import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "../styles/compose.css";
import API from "../api";

export default function ComposePage() {
  const [form, setForm] = useState({
    to: "",
    subject: "",
    text: "",
  });

  const [message, setMessage] = useState("");
  const [files, setFiles] = useState([]);
  const { token } = useAuth();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFilesChange = (e) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selected]);
    }
  };

  const handleRemoveFile = (indexToRemove) => {
    setFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("to", form.to);
    formData.append("subject", form.subject);
    formData.append("text", form.text);

    files.forEach((file) => {
      formData.append("files", file);
    });


    try {
      const res = await API.post("/send-mail", formData);
      setMessage("Mail đã được gửi thành công");
    } catch (error) {
      setMessage("Gửi mail thất bại");
    }
  };

  return (
    <div className="compose-container">
      <h2>Gửi Email</h2>
      <input
        name="to"
        type="email"
        placeholder="Đến"
        value={form.to}
        onChange={(e) => {
          handleChange(e);
        }}
      />
      <input
        name="subject"
        type="text"
        placeholder="Tiêu đề"
        value={form.subject}
        onChange={(e) => {
          handleChange(e);
        }}
      />
      <textarea
        name="text"
        placeholder="Nội dung"
        rows={10}
        value={form.text}
        onChange={(e) => {
          handleChange(e);
        }}
      />
      <label htmlFor="fileUpload" className="file-label">
        Chọn tệp đính kèm
      </label>
      <input
        id="fileUpload"
        type="file"
        multiple
        onChange={handleFilesChange}
        style={{ display: "none" }}
      />

      <ul className="file-list">
        {files.map((file, index) => (
          <li key={index} style={{ marginBottom: "6px" }}>
            {file.name} ({(file.size / 1024).toFixed(1)} KB)
            <button onClick={() => handleRemoveFile(index)}>X</button>
          </li>
        ))}
      </ul>
      <button onClick={handleSubmit}>Gửi</button>
      {message && <p>{message}</p>}
    </div>
  );
}
