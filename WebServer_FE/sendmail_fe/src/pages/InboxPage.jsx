import MailViewer from "../components/MailViewer";

export default function InboxPage() {
  return (
    <MailViewer
      title="Thư đến"
      endpoint="/inbox"
      enableRealtime={true}
      box="INBOX"
    />
  );
}
