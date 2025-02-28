import type { RouteRecordRaw } from "vue-router";

export const anonymousRoutes: RouteRecordRaw[] = [
  {
    path: "/anonymous",
    name: "Anonymous",
    component: () => import("@/views/Layouts/PublicLayout.vue"),
    meta: {
      requiresAuth: false,
    },
    children: [
      {
        path: "",
        name: "Login",
        component: () => import("@/views/pages/Anonymous/Anonymous.vue"),
      },
    ],
  },
];
