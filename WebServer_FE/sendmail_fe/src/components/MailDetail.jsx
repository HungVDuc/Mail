import { getOriginalFilename } from "../utils/filename";
import { memo } from "react";
const MailDetail = ({ email }) => {
  if (!email) {
    return (
      <div>
        <h3>Chọn một thư để xem chi tiết</h3>
      </div>
    );
  }

  return (
    <div className="mail-detail">
      <h2 className="mail-detail-subject">{email.subject}</h2>

      <div className="mail-detail-meta">
        <span>
          <strong>Từ:</strong> {email.from}
        </span>
        <span>
          <strong>Ngày:</strong> {new Date(email.date).toLocaleString()}
        </span>
      </div>

      <div className="mail-detail-body">
        <h4>Nội dung:</h4>
        <p>{email.text || email.subject}</p>
      </div>

      {email.attachments?.length > 0 && (
        <div className="attachments">
          <h4>Đính kèm:</h4>
          <ul>
            {email.attachments.map((file, idx) => (
              <li key={idx}>
                <a
                  href={`${import.meta.env.VITE_API_URL}/download/${file.filename}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {getOriginalFilename(file.filename)}
                </a>
                <span className="file-size">
                  ({(file.size / 1024).toFixed(1)} KB)
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default memo(MailDetail);
