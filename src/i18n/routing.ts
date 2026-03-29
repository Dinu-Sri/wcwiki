import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const routing = defineRouting({
  locales: ["en", "si"],
  defaultLocale: "en",
  localePrefix: "as-needed", // No prefix for default locale (en)
});

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
