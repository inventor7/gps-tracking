import type { RouteRecordRaw } from "vue-router";

export const authenticatedRoutes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "Authenticated",
    component: () => import("@/views/Layouts/AuthenticatedLayout.vue"),
    meta: {
      requiresAuth: true,
    },
    children: [
      {
        path: "",
        name: "Home",
        component: () => import("@/views/pages/RealTime.vue"),
        meta: {
          title: "Live Tracking",
          transition: "slide-left",
        },
      },
      {
        path: "",
        name: "History",
        component: () => import("@/views/pages/History.vue"),
        meta: {
          title: "History",
          transition: "slide-left",
        },
      },
      {
        path: "replay/:actorId",
        name: "Replay",
        component: () => import("@/views/pages/Replay.vue"),
        meta: {
          title: "Replay Mode",
          transition: "slide-left",
        },
      },
      {
        path: "",
        name: "Analytics",
        component: () => import("@/views/pages/Analytics.vue"),
        meta: {
          title: "Analytics",
          transition: "slide-left",
        },
      },
    ],
  },
];
