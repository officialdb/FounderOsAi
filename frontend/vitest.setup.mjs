import React from "react";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

afterEach(() => {
  cleanup();
});

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = ResizeObserverMock;
}

if (typeof window !== "undefined") {
  window.matchMedia ??= vi.fn().mockImplementation(() => ({
    matches: false,
    media: "",
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));

  window.scrollTo = vi.fn();
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
}

vi.mock("next/image", () => ({
  default: (props) => {
    const { fill, priority, placeholder, blurDataURL, loader, ...rest } = props;

    return React.createElement("img", {
      ...rest,
      src: props.src,
      alt: props.alt,
    });
  },
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }) =>
    React.createElement(
      "a",
      {
        href: typeof href === "string" ? href : href.pathname ?? "#",
        ...rest,
      },
      children,
    ),
}));
