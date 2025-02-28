import { createApp, type App, type Component } from "vue";
import { createLogger } from "@/utils/logger";

interface VueMountedElement extends HTMLElement {
  _vue_app?: App;
}

export function useVueMarker() {
  const logger = createLogger("VueMarker");

  const mountVueComponent = <T extends Record<string, any>>(
    component: Component,
    props: T
  ): HTMLElement => {
    try {
      // Create container element
      const container = document.createElement("div") as VueMountedElement;
      container.style.position = "relative";
      container.style.zIndex = "10000";

      // Create and mount Vue app with component
      const app = createApp(component, props);

      // Add error handler
      app.config.errorHandler = (err, instance, info) => {
        logger.error("Vue component error:", {
          error: err,
          componentName: component.name || "Unknown",
          info,
        });
      };

      app.mount(container);

      // Store app reference for cleanup
      container._vue_app = app;

      return container;
    } catch (error) {
      logger.error("Error mounting Vue component:", {
        error,
        componentName: component.name || "Unknown",
        props,
      });
      // Create fallback element in case of error
      const fallback = document.createElement("div");
      fallback.style.position = "relative";
      fallback.innerHTML = "⚠️";
      return fallback;
    }
  };

  const unmountVueComponent = (element: HTMLElement) => {
    try {
      const vueElement = element as VueMountedElement;
      if (vueElement._vue_app) {
        vueElement._vue_app.unmount();
        delete vueElement._vue_app;
      } else {
        logger.warn("No Vue app found on element");
      }
    } catch (error) {
      logger.error("Error unmounting Vue component:", error);
    }
  };

  const isVueElement = (element: HTMLElement): element is VueMountedElement => {
    return "_vue_app" in element;
  };

  return {
    mountVueComponent,
    unmountVueComponent,
    isVueElement,
  };
}
