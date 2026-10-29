import { existsSync, mkdirSync } from "fs";
import { join } from "path";

export function getUploadsDir(): string {
  const dir = process.env.UPLOAD_DIR || join(process.cwd(), "uploads");
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  return dir;
}
