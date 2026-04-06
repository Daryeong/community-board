import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { PostForm } from "./post-form";

describe("PostForm", () => {
  it("shows a live content character counter", async () => {
    const user = userEvent.setup();

    render(
      <PostForm
        action={async () => ({})}
        submitLabel="등록하기"
        categories={[]}
      />,
    );

    const content = screen.getByLabelText("내용");
    await user.type(content, "안녕하세요");

    expect(screen.getByText(/5자/)).not.toBeNull();
  });
});
