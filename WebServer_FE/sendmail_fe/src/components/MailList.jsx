import { memo } from "react";

const MailList = ({ emails, onSelect }) => {
  return (
    <div>
      <ul>
        {emails.map((mail, index) => (
          <li className="mail-item" key={index} onClick={() => onSelect(mail)}>
            <h3 className="mail-subject">{mail.subject}</h3>
            <p className="mail-meta">
              <span className="mail-from">{mail.from}</span>
              <span className="mail-date">
                {new Date(mail.date).toLocaleString()}
              </span>
            </p>
            <div className="body-preview">{mail.body}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default memo(MailList);
