import { render, screen } from "@testing-library/react";
import { test, expect } from "vitest";

test("login page render", () => {
    render(<div>Login Page</div>);
    expect(screen.getByText("Login Page")).toBeInTheDocument();
});