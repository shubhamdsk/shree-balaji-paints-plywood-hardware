import { screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import AdminEnquiryList from "@/components/admin/AdminEnquiryList";
import { SESSION_COOKIE } from "@/server/auth/session";
import { enquiries } from "@/server/db/schema";
import { logIn } from "@/services/auth-service";
import { createCustomerEnquiry, ENQUIRY_PAGE_SIZE, getEnquiryCounts, listAdminEnquiries } from "@/services/enquiry-service";
import { setupTestDatabase } from "@/test/db";
import { cookieJar } from "@/test/mocks/next-headers";
import { renderWithProviders } from "@/test/render";

vi.mock("next/headers", () => import("@/test/mocks/next-headers"));
vi.mock("next/navigation", () => import("@/test/mocks/next-navigation"));
vi.mock("next/link", () => import("@/test/mocks/next-link"));

const db = setupTestDatabase();

beforeEach(async () => {
  vi.stubEnv("ADMIN_USERNAME", "owner");
  vi.stubEnv("ADMIN_INITIAL_PASSWORD", "owner-password-123");
  const result = await logIn("owner", "owner-password-123");
  if (!result.ok) throw new Error("login failed");
  cookieJar.set(SESSION_COOKIE, { value: result.token });
});

async function renderList() {
  const [page, counts] = await Promise.all([listAdminEnquiries(), getEnquiryCounts()]);
  return renderWithProviders(<AdminEnquiryList initialPage={page} initialCounts={counts} />);
}

async function addDemoEnquiries() {
  await createCustomerEnquiry({
    name: "Rajesh Shinde",
    phone: "9876543210",
    productId: "",
    quantity: "",
    message: "Need 20L royale luxury emulsion in shade 0412",
  });
  await createCustomerEnquiry({
    name: "Amit Kumar",
    phone: "9123456789",
    productId: "",
    quantity: "",
    message: "Commercial plywood sheet prices?",
  });
}

describe("AdminEnquiryList", () => {
  test("searches enquiries on the server", async () => {
    await addDemoEnquiries();
    const { user } = await renderList();
    expect(screen.getByText("Rajesh Shinde")).toBeTruthy();

    await user.type(screen.getByLabelText(/Search enquiries/i), "Plywood");

    await waitFor(() => expect(screen.queryByText("Rajesh Shinde")).toBeNull());
    expect(screen.getByText("Amit Kumar")).toBeTruthy();
  });

  test("filters by status and moves the counts when a lead is contacted", async () => {
    await addDemoEnquiries();
    const { user } = await renderList();
    const newFilter = within(screen.getByRole("group", { name: "Show" })).getByRole("button", { name: /^New\s*2$/ });

    await user.click(
      within(screen.getByRole("group", { name: "Status of Rajesh Shinde" })).getByRole("button", { name: "Contacted" }),
    );
    await waitFor(() => expect(newFilter.textContent).toMatch(/1$/));

    await user.click(newFilter);
    expect(newFilter.getAttribute("aria-pressed")).toBe("true");
    await waitFor(() => expect(screen.queryByText("Rajesh Shinde")).toBeNull());
    expect(screen.getByText("Amit Kumar")).toBeTruthy();
  });

  test("loads older enquiries on request", async () => {
    const createdAt = new Date();
    await db()
      .insert(enquiries)
      .values(
        Array.from({ length: ENQUIRY_PAGE_SIZE + 1 }, (_, i) => ({
          id: `enq_${String(i).padStart(3, "0")}`,
          name: `Customer ${i}`,
          message: "Paint enquiry",
          createdAt,
        })),
      );
    const { user } = await renderList();
    expect(screen.getAllByRole("listitem")).toHaveLength(ENQUIRY_PAGE_SIZE);

    await user.click(screen.getByRole("button", { name: "Load more enquiries" }));

    await waitFor(() => expect(screen.getAllByRole("listitem")).toHaveLength(ENQUIRY_PAGE_SIZE + 1));
    expect(screen.queryByRole("button", { name: "Load more enquiries" })).toBeNull();
  });
});
