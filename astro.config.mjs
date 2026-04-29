import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

export default defineConfig({
	site: "https://gwilym.ca",
	vite: {
		plugins: [tailwindcss()],
	},
});
