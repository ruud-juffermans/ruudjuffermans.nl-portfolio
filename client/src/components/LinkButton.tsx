import { Button, type ButtonProps } from "@mui/material";
import type { ComponentProps } from "react";
import { Link } from "@/i18n/navigation";

type LinkHref = ComponentProps<typeof Link>["href"];

/**
 * A MUI Button that navigates to a localized dynamic route.
 *
 * MUI's Button overloads collapse `href` to a plain string, which drops
 * next-intl's typed `{ pathname, params }` form that localized dynamic routes
 * need — `Box`/`Card component={Link}` keep it, `Button` doesn't. The object is
 * forwarded to Link untouched at runtime, so only the type needs correcting;
 * this wrapper confines that cast to one place instead of every call site.
 */
export default function LinkButton({
  href,
  ...props
}: Omit<ButtonProps, "href"> & { href: LinkHref }) {
  const linkProps = { component: Link, href } as unknown as ButtonProps;
  return <Button {...props} {...linkProps} />;
}
