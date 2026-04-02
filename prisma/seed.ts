import path from "node:path";
import Database from "better-sqlite3";

const dbPath = path.resolve(process.cwd(), "dev.db");
const db = new Database(dbPath);

const categories = [
  { name: "자유게시판", slug: "free", color: "blue" },
  { name: "Q&A", slug: "qna", color: "green" },
  { name: "팁과 공유", slug: "tips", color: "amber" },
  { name: "새소식", slug: "news", color: "purple" },
  { name: "일상", slug: "daily", color: "pink" },
];

for (const cat of categories) {
  db.prepare(`
    INSERT OR IGNORE INTO Category (name, slug, color)
    VALUES (?, ?, ?)
  `).run(cat.name, cat.slug, cat.color);
}

console.log("Categories seeded!");
db.close();
