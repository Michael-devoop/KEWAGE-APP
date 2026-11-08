import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { StatusBadge } from "@/components/jobs/status-badge";
import en from "@/messages/en.json";
import { formatDistance, initials, timeAgo } from "@/lib/format";

describe("StatusBadge", () => {
  it("renders the translated label for each status", () => {
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <StatusBadge status="SEARCHING" />
      </NextIntlClientProvider>,
    );
    expect(screen.getByText(en.status.SEARCHING)).toBeInTheDocument();
  });
});

describe("format helpers", () => {
  it("formats short and long distances", () => {
    expect(formatDistance(0.25)).toBe("250 m");
    expect(formatDistance(3.14)).toBe("3.1 km");
  });

  it("builds initials from at most two names", () => {
    expect(initials("Hana Girma")).toBe("HG");
    expect(initials("Dawit")).toBe("D");
  });

  it("describes past timestamps", () => {
    const iso = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    expect(timeAgo(iso)).toBe("2 hours ago");
  });
});
