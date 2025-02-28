import type { User } from "@/models/User.Model";

const AUTH_KEY = "auth_data";

export class Auth {
  async setAuthData(user: User) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  }

  async getUserData() {
    return JSON.parse(localStorage.getItem(AUTH_KEY) || "null");
  }

  async clearAuthData() {
    localStorage.removeItem(AUTH_KEY);
  }

  async isLoggedIn() {
    return (await this.getUserData()) !== null;
  }
}
