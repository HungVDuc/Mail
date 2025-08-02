require ["fileinto", "copy"];

if address :is "from" "${user_email}" {
  fileinto :copy "Sent";
}
