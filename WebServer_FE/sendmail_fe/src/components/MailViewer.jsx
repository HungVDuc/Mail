import { useEffect, useState, useCallback } from "react";
import { io } from "socket.io-client";
import SearchBar from "./SearchBar";
import MailList from "./MailList";
import MailDetail from "./MailDetail";
import API from "../api";
import "../styles/inbox.css";

export default function MailViewer({ title, endpoint, enableRealtime = false, box = "INBOX", hideFromField = false }) {
  const [emails, setEmails] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [filters, setFilters] = useState({
    from: "",
    subject: "",
    fromDate: "",
    toDate: "",
    hasAttachment: false,
  });

  useEffect(() => {
    API.get(endpoint)
      .then((res) => setEmails(res.data.data))
      .catch((err) => console.error(err));
  }, [endpoint]);

  useEffect(() => {
    if (!enableRealtime) return;
    const socket = io("http://localhost:3000");

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("new_mail", (data) => {
      setEmails((prev) => [data.mail, ...prev]);
    });

    return () => socket.disconnect();
  }, [enableRealtime]);

  const handleSearch = async (e) => {
    e.preventDefault();

    try {
      const res = await API.get("/search", {
        params: {
          q: search,
          box,
          ...filters,
        },
      });
      setEmails(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectEmail = useCallback((email) => {
    setSelectedEmail(email);
  }, []);

  return (
    <div className="inbox-container">
      <div className="mail-list">
        <SearchBar
          value={search}
          onChange={setSearch}
          handleSearch={handleSearch}
          filters={filters}
          onFilterChange={setFilters}
          hideFromField={hideFromField}
        />
        <h2>{title}</h2>
        <MailList emails={emails} onSelect={handleSelectEmail} />
      </div>
      <div className="mail-detail">
        <MailDetail email={selectedEmail} />
      </div>
    </div>
  );
}
