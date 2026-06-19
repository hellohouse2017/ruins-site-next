"use client";

import siteConfig from "@/data/site-config.json";

export function StickyLineButton() {
  return (
    <a
      href={siteConfig.contact.lineUrl}
      target="_blank"
      rel="noopener"
      className="sticky-btn"
      aria-label="LINE 詢問檔期"
    >
      <i className="fab fa-line" />
    </a>
  );
}
