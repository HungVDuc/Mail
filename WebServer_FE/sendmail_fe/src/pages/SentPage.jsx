import MailViewer from "../components/MailViewer";

export default function SentPage() {
  return (
    <MailViewer
      title="Thư đã gửi"
      endpoint="/sent"
      enableRealtime={false}
      box="Sent"
      hideFromField={true}
    />
  );
}
