FROM debian:bullseye

ENV DEBIAN_FRONTEND=noninteractive

# Cài các gói cần thiết
RUN apt-get update && apt-get install -y \
  curl \
  postfix \
  postfix-mysql \
  dovecot-core \
  dovecot-imapd \
  dovecot-pop3d \
  dovecot-lmtpd \
  dovecot-mysql \
  dovecot-sieve \
  dovecot-managesieved \
  libsasl2-modules \
  rsyslog \
  supervisor \
  && apt-get clean && rm -rf /var/lib/apt/lists/*



# Tạo user vmail với UID 5000
RUN groupadd -g 5000 vmail \
  && useradd -r -u 5000 -g vmail -d /var/mail vmail

# Tạo thư mục maildir và phân quyền cho vmail
RUN mkdir -p /var/mail/vhosts \
  && chown -R vmail:vmail /var/mail/vhosts

# Tạo file /etc/mailname để tránh lỗi postfix
RUN echo "local.test" > /etc/mailname

# Copy cấu hình vào container
COPY postfix/ /etc/postfix/
# Sửa quyền file dynamicmaps.cf để tránh cảnh báo của Postfix
RUN chown root:root /etc/postfix/dynamicmaps.cf && chmod 644 /etc/postfix/dynamicmaps.cf
COPY dovecot/ /etc/dovecot/
COPY rsyslog/rsyslog.conf /etc/rsyslog.conf
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Mặc định chạy script entrypoint
CMD ["/entrypoint.sh"]
