import "@testing-library/jest-dom";

jest.mock("next/link", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: ({ href, children, ...props }: any) =>
      React.createElement(
        "a",
        {
          href: typeof href === "string" ? href : href?.pathname || "#",
          ...props,
        },
        children
      ),
  };
});

jest.mock("next/navigation", () => ({
  __esModule: true,
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), prefetch: jest.fn() }),
  usePathname: () => "/",
  useSearchParams: () => ({ get: () => null }),
  useParams: () => ({}),
}));
