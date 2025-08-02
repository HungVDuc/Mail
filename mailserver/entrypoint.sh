#!/bin/bash

# Tạo mail spool directory nếu chưa có
mkdir -p /var/mail

# Khởi động dịch vụ rsyslog
service rsyslog start

# Khởi động postfix
service postfix start

# Khởi động dovecot
service dovecot start

# Giữ container chạy mãi
tail -f /var/log/mail.log
