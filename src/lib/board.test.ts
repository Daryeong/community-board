import { describe, expect, it } from "vitest";

import {
  buildCommentTree,
  canManageByAuthorId,
  loginSchema,
  paginate,
  postSchema,
  registerSchema,
} from "./board";

describe("registerSchema", () => {
  it("rejects duplicate-prone blank values and short passwords", () => {
    const result = registerSchema.safeParse({
      username: " ",
      nickname: " ",
      email: "invalid",
      password: "1234",
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    const fields = result.error.flatten().fieldErrors;
    expect(fields.username?.[0]).toContain("아이디");
    expect(fields.nickname?.[0]).toContain("닉네임");
    expect(fields.email?.[0]).toContain("이메일");
    expect(fields.password?.[0]).toContain("비밀번호");
  });
});

describe("loginSchema", () => {
  it("accepts username or email plus password", () => {
    const result = loginSchema.safeParse({
      identifier: "tester",
      password: "password123",
    });

    expect(result.success).toBe(true);
  });
});

describe("postSchema", () => {
  it("requires both title and content", () => {
    const result = postSchema.safeParse({ title: "", content: "" });

    expect(result.success).toBe(false);
    if (result.success) return;
    const fields = result.error.flatten().fieldErrors;
    expect(fields.title?.[0]).toContain("제목");
    expect(fields.content?.[0]).toContain("내용");
  });
});

describe("updateProfileSchema", () => {
  it("accepts a short bio and theme choice", async () => {
    const { updateProfileSchema } = await import("./board");

    const result = updateProfileSchema.safeParse({
      nickname: "테스터",
      email: "tester@example.com",
      avatarUrl: null,
      bio: "한 줄 소개입니다.",
      profileTheme: "sunset",
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.bio).toBe("한 줄 소개입니다.");
    expect(result.data.profileTheme).toBe("sunset");
  });
});

describe("buildCommentTree", () => {
  it("nests one-level replies beneath their parent comment", () => {
    const tree = buildCommentTree([
      {
        id: 2,
        parentId: 1,
        content: "reply",
        deletedAt: null,
        createdAt: new Date("2026-01-02"),
      },
      {
        id: 1,
        parentId: null,
        content: "parent",
        deletedAt: null,
        createdAt: new Date("2026-01-01"),
      },
    ]);

    expect(tree).toHaveLength(1);
    expect(tree[0].children).toHaveLength(1);
    expect(tree[0].children[0].content).toBe("reply");
  });
});

describe("canManageByAuthorId", () => {
  it("only allows the author to manage the resource", () => {
    expect(canManageByAuthorId(1, 1)).toBe(true);
    expect(canManageByAuthorId(1, 2)).toBe(false);
    expect(canManageByAuthorId(1, null)).toBe(false);
  });
});

describe("paginate", () => {
  it("normalizes invalid pages and calculates skip/take", () => {
    expect(paginate("0", 10)).toEqual({ page: 1, take: 10, skip: 0 });
    expect(paginate("3", 10)).toEqual({ page: 3, take: 10, skip: 20 });
  });
});
