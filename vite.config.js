import { defineConfig } from "vite";

export default defineConfig({
  server: {
    open: "/home/home.html",
  },
  build: {
    rollupOptions: {
      input: {
        main: "/home/home.html",
      },
    },
  },
});
