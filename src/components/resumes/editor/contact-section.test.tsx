import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ContactSection } from "./contact-section";

const createMockContact = () => ({
  name: "John Doe",
  email: "john@example.com",
  phone: "+1 555-123-4567",
  location: "San Francisco, CA",
  linkedin: "linkedin.com/in/johndoe",
  github: "github.com/johndoe",
});

describe("ContactSection", () => {
  describe("rendering", () => {
    it("should render all contact fields", () => {
      const onChange = vi.fn();
      render(<ContactSection data={createMockContact()} onChange={onChange} />);

      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/location/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/linkedin/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/github/i)).toBeInTheDocument();
    });

    it("should display contact information title", () => {
      const onChange = vi.fn();
      render(<ContactSection data={createMockContact()} onChange={onChange} />);

      expect(screen.getByText("Contact Information")).toBeInTheDocument();
    });

    it("should show required indicators for name and email", () => {
      const onChange = vi.fn();
      render(<ContactSection data={createMockContact()} onChange={onChange} />);

      const requiredIndicators = screen.getAllByText("*");
      expect(requiredIndicators.length).toBeGreaterThanOrEqual(2);
    });

    it("should populate fields with provided data", () => {
      const onChange = vi.fn();
      const contact = createMockContact();
      render(<ContactSection data={contact} onChange={onChange} />);

      expect(screen.getByLabelText(/full name/i)).toHaveValue(contact.name);
      expect(screen.getByLabelText(/email/i)).toHaveValue(contact.email);
      expect(screen.getByLabelText(/phone/i)).toHaveValue(contact.phone);
      expect(screen.getByLabelText(/location/i)).toHaveValue(contact.location);
      expect(screen.getByLabelText(/linkedin/i)).toHaveValue(contact.linkedin);
      expect(screen.getByLabelText(/github/i)).toHaveValue(contact.github);
    });
  });

  describe("interactions", () => {
    it("should call onChange when name is updated", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const contact = createMockContact();
      render(<ContactSection data={contact} onChange={onChange} />);

      const nameInput = screen.getByLabelText(/full name/i);
      await user.type(nameInput, "X");

      expect(onChange).toHaveBeenCalled();
      // Verify onChange was called with name field updated
      const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
      expect(lastCall.name).toBe(contact.name + "X");
    });

    it("should call onChange when email is updated", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const contact = createMockContact();
      render(<ContactSection data={contact} onChange={onChange} />);

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, "X");

      expect(onChange).toHaveBeenCalled();
      // Verify onChange was called with email field updated
      const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
      expect(lastCall.email).toBe(contact.email + "X");
    });

    it("should call onChange when phone is updated", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const contact = createMockContact();
      render(<ContactSection data={contact} onChange={onChange} />);

      const phoneInput = screen.getByLabelText(/phone/i);
      await user.type(phoneInput, "0");

      expect(onChange).toHaveBeenCalled();
      // Verify onChange was called with phone field updated
      const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
      expect(lastCall.phone).toBe(contact.phone + "0");
    });
  });

  describe("disabled state", () => {
    it("should disable all inputs when disabled prop is true", () => {
      const onChange = vi.fn();
      render(<ContactSection data={createMockContact()} onChange={onChange} disabled />);

      expect(screen.getByLabelText(/full name/i)).toBeDisabled();
      expect(screen.getByLabelText(/email/i)).toBeDisabled();
      expect(screen.getByLabelText(/phone/i)).toBeDisabled();
      expect(screen.getByLabelText(/location/i)).toBeDisabled();
      expect(screen.getByLabelText(/linkedin/i)).toBeDisabled();
      expect(screen.getByLabelText(/github/i)).toBeDisabled();
    });
  });

  describe("empty state", () => {
    it("should handle empty contact data", () => {
      const onChange = vi.fn();
      const emptyContact = { name: "", email: "" };
      render(<ContactSection data={emptyContact} onChange={onChange} />);

      expect(screen.getByLabelText(/full name/i)).toHaveValue("");
      expect(screen.getByLabelText(/email/i)).toHaveValue("");
    });
  });
});
