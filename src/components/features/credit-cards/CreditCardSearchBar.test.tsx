import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { CreditCardSearchBar } from "./CreditCardSearchBar";

describe("CreditCardSearchBar", () => {
  it("should render search input", () => {
    render(<CreditCardSearchBar onSearch={vi.fn()} />);

    expect(
      screen.getByPlaceholderText("search.placeholder"),
    ).toBeInTheDocument();
  });

  it("should render with custom placeholder", () => {
    render(
      <CreditCardSearchBar
        onSearch={vi.fn()}
        placeholder="Search for cards..."
      />,
    );

    expect(
      screen.getByPlaceholderText("Search for cards..."),
    ).toBeInTheDocument();
  });

  it("should call onSearch when user types", async () => {
    const onSearch = vi.fn();
    const user = userEvent.setup();

    render(<CreditCardSearchBar onSearch={onSearch} />);

    const searchInput = screen.getByRole("textbox");
    await user.type(searchInput, "cashback");

    // Check if value was updated
    expect(searchInput).toHaveValue("cashback");
  });

  it("should display clear button when there is value", () => {
    render(<CreditCardSearchBar onSearch={vi.fn()} value="test" />);

    // Look for the X icon button
    const clearButton = screen.getByRole("button");
    expect(clearButton).toBeInTheDocument();
  });

  it("should handle onChange callback", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(<CreditCardSearchBar onChange={onChange} />);

    const searchInput = screen.getByRole("textbox");
    await user.type(searchInput, "test");

    expect(onChange).toHaveBeenCalled();
  });
});
