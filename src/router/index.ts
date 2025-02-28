import { createRouter, createWebHistory } from "vue-router";
import { authenticatedRoutes } from "./routes/authenticated";
import { anonymousRoutes } from "./routes/anonymous";
import { authGuard } from "./routes/guards/authGuard";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [...anonymousRoutes, ...authenticatedRoutes],
});

router.beforeEach(authGuard);

export default router;
