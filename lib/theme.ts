import { createTheme } from "flowbite-react";

/** Tema Flowbite mengikuti palet warna immax-app */
export const immaxFlowbiteTheme = createTheme({
  button: {
    color: {
      primary:
        "bg-primary text-white hover:bg-primary-600 focus:ring-4 focus:ring-primary-300 dark:focus:ring-primary-800",
    },
  },
});
