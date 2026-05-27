import { auth } from "@/auth";

export async function requireUserId(): Promise<string> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    throw new Error("Bạn cần đăng nhập để sử dụng dữ liệu tài chính.");
  }
  return userId;
}
