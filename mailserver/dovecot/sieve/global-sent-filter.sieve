#require ["variables", "fileinto", "envelope", "relational", "comparator-i;ascii-casemap"];

#set "recipient" "${envelope.to}";

#if allof (
#  address :is :comparator "i;ascii-casemap" "From" ["${envelope.to}"]
#  envelope :is :comparator "i;ascii-casemap" "To" "${recipient}"
#) {
#  fileinto "Sent";
#  stop;
#}

require ["fileinto", "envelope", "comparator-i;ascii-casemap"];

if allof (
  address :is :comparator "i;ascii-casemap" "From" ["user1@local.test"],
  envelope :is :comparator "i;ascii-casemap" "To" "user1@local.test"
) {
  fileinto "Sent";
  stop;
}


