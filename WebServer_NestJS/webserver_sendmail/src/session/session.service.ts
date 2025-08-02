import { Injectable } from '@nestjs/common';
import { ImapSimple } from 'imap-simple';

@Injectable()
export class SessionService {
  private sessionMap = new Map<
    string,
    { password?: string; accessToken?: string }
  >();
  private sessionIMap = new Map<string, ImapSimple>();

  // Cache Info User || AccessToken 
  setPassword(username: string, password: string) {
    const session = this.sessionMap.get(username) || {};
    session.password = password;
    this.sessionMap.set(username, session);
    this.setAutoClear(username);
  }

  setAccessToken(username: string, accessToken: string) {
    const session = this.sessionMap.get(username) || {};
    session.accessToken = accessToken;
    this.sessionMap.set(username, session);
    this.setAutoClear(username);
  }

  getPassword(username: string): string | undefined {
    return this.sessionMap.get(username)?.password;
  }

  getAccessToken(username: string): string | undefined {
    return this.sessionMap.get(username)?.accessToken;
  }

  clearSession(username: string) {
    this.sessionMap.delete(username);
  }

  private setAutoClear(username: string) {
    setTimeout(
      () => {
        this.sessionMap.delete(username);
      },
      15 * 60 * 1000,
    ); // 15 phút
  }

  // Cache connection IMAP
  setSessionImap(username: string, imap: ImapSimple) {
    this.sessionIMap.set(username, imap);
  }

  getSessionImap(username: string): ImapSimple | undefined {
    return this.sessionIMap.get(username);
  }

  clearSessionImap(username: string) {
    this.sessionIMap.delete(username);
  }
}
