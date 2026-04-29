import { render, screen } from "@testing-library/react";
import { test, expect } from "vitest";

test("render route component basic", () => {
render(<div>Route Page</div>);
expect(screen.getByText("Route Page")).toBeInTheDocument();
});