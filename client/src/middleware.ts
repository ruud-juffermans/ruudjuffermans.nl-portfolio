import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // opengraph-image routes carry their locale in the path already; letting the
  // i18n middleware at them strips the /nl prefix and redirects to the wrong
  // locale's image.
  matcher: "/((?!api|_next|_vercel|.*\\..*|.*opengraph-image).*)",
};
