import { render } from "@react-email/render";
import type { ReactElement } from "react";

/**
 * Compiles a React Email element to HTML + plain text for Resend.
 */
export async function renderReactEmail(
  element: ReactElement
): Promise<{ html: string; text: string }> {
  const [html, text] = await Promise.all([
    render(element),
    render(element, { plainText: true }),
  ]);
  return { html, text };
}
