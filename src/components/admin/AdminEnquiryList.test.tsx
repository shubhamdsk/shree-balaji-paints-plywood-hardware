import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import AdminEnquiryList from "@/components/admin/AdminEnquiryList";
import type { EnquiryRecord } from "@/types";

const demoEnquiries: EnquiryRecord[] = [
  {
    id: "enq_1",
    name: "Rajesh Shinde",
    phone: "9876543210",
    productName: "Royale Luxury Emulsion",
    message: "Need 20L royale luxury emulsion in shade 0412",
    status: "new",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "enq_2",
    name: "Amit Kumar",
    phone: "9123456789",
    message: "Commercial plywood sheet prices?",
    status: "contacted",
    notes: "Quoted ₹1,250 per sheet",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

describe("AdminEnquiryList", () => {
  test("renders enquiry leads and filters by search query", () => {
    render(<AdminEnquiryList initialEnquiries={demoEnquiries} />);

    expect(screen.getByText("Rajesh Shinde")).toBeDefined();
    expect(screen.getByText("Amit Kumar")).toBeDefined();

    const searchInput = screen.getByLabelText(/Search enquiries/i);
    fireEvent.change(searchInput, { target: { value: "Plywood" } });

    expect(screen.queryByText("Rajesh Shinde")).toBeNull();
    expect(screen.getByText("Amit Kumar")).toBeDefined();
  });

  test("filters enquiries by status badge", () => {
    render(<AdminEnquiryList initialEnquiries={demoEnquiries} />);

    const newFilterBtn = screen.getByRole("button", { name: "New Leads" });
    fireEvent.click(newFilterBtn);

    expect(screen.getByText("Rajesh Shinde")).toBeDefined();
    expect(screen.queryByText("Amit Kumar")).toBeNull();
  });
});
