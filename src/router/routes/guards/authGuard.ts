import { Auth } from "@/services/auth/auth.service";
import type { NavigationGuardNext, RouteLocationNormalized } from "vue-router";

const auth = new Auth();

export async function authGuard(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  const isLoggedIn = await auth.isLoggedIn();

  if (to.meta.requiresAuth && !isLoggedIn) {
    return next({
      name: "Login",
    });
  } else if (!to.meta.requiresAuth && isLoggedIn) {
    return next({ name: "Home" });
  }

  next();
}
