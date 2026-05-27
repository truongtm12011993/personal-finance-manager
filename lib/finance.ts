export type MonthlyTotal = {
  month: string;
  income: number;
  expense: number;
  balance: number;
};

export function formatCurrency(value: number) {
  const rounded = Math.round(value);
  const label = Math.abs(rounded).toLocaleString("vi-VN");
  return `${rounded < 0 ? "-" : ""}${label}₫`;
}

export function formatVnd(value: number | { toString(): string }): string {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "0";
  return new Intl.NumberFormat("vi-VN").format(Math.round(numeric));
}

export function monthKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function monthLabel(month: string) {
  if (month === "all") return "Tất cả thời gian";
  const [year, m] = month.split("-");
  return `Tháng ${m}/${year}`;
}

export function diffDays(from: Date, to: Date): number {
  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  return Math.ceil((to.getTime() - from.getTime()) / MS_PER_DAY);
}

export function normalizeText(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");
}

const EXPENSE_CATEGORY_RULES: Array<[RegExp, string, RegExp?]> = [
  [/\b(ăn|uống|ăn uống|cơm|bún|phở|cháo|ăn sáng|ăn trưa|ăn tối|snack)\b|cafe|trà|sữa|bánh/i, "Ăn uống", /\b(an|uong|an uong|com|bun|pho|chao|an sang|an trua|an toi|snack)\b|cafe|tra|sua|banh/i],
  [/\b(xăng|dầu|grab|be|taxi|xe buýt|vé xe|vé tàu|gửi xe|đi lại|di chuyển)\b/i, "Đi lại", /\b(xang|dau|grab|be|taxi|xe buyt|ve xe|ve tau|gui xe|di lai|di chuyen)\b/i],
  [/(điện|nước|internet|wifi|gas|tiền nhà|thuê nhà|chung cư|phí nhà|truyền hình|cáp|cap quang)/i, "Sinh hoạt", /(dien|nuoc|internet|wifi|gas|tien nha|thue nha|chung cu|phi nha|truyen hinh|cap quang|cap)/i],
  [/\b(mua sắm|shopping|quần|áo|giày|túi|đồ dùng|đi siêu thị)\b/i, "Mua sắm", /\b(mua sam|shopping|quan|ao|giay|tui|do dung|di sieu thi)\b/i],
  [/\b(y tế|khám|thuốc|bệnh viện|nha khoa)\b/i, "Y tế", /\b(y te|kham|thuoc|benh vien|nha khoa)\b/i],
  [/\b(giáo dục|học|khóa học|sách|lớp|học phí)\b/i, "Giáo dục", /\b(giao duc|hoc|khoa hoc|sach|lop|hoc phi)\b/i],
  [/\b(giải trí|game|netflix|spotify|xem phim|karaoke)\b/i, "Giải trí", /\b(giai tri|game|netflix|spotify|xem phim|karaoke)\b/i],
  [/\b(du lịch|khách sạn|vé máy bay|tour)\b/i, "Du lịch", /\b(du lich|khach san|ve may bay|tour)\b/i],
  [/\b(quà|sinh nhật|đám cưới|hiếu hỉ|gia đình)\b/i, "Gia đình", /\b(qua|sinh nhat|dam cuoi|hieu hi|gia dinh)\b/i],
  [/\b(phí|lệ phí|phí dịch vụ|phí thẻ|lãi vay|bảo hiểm)\b/i, "Phí & bảo hiểm", /\b(phi|le phi|phi dich vu|phi the|lai vay|bao hiem)\b/i],
  [/\b(đầu tư|mua vàng|chứng khoán|crypto|tiết kiệm)\b/i, "Đầu tư", /\b(dau tu|mua vang|chung khoan|crypto|tiet kiem)\b/i],
  [/(nạp tiền|điện thoại|phone|data|sim|4g|5g|gói cước|goi cuoc)/i, "Viễn thông", /(nap tien|dien thoai|phone|data|sim|4g|5g|goi cuoc)/i],
  [/\b(đồ ăn cho thú|thú cưng|pet)\b/i, "Thú cưng", /\b(do an cho thu|thu cung|pet)\b/i],
];

export function guessExpenseCategory(text: string): string {
  const value = text.toLowerCase();
  const normalized = normalizeText(value);
  for (const [regex, category, normalizedRegex] of EXPENSE_CATEGORY_RULES) {
    if (regex.test(value)) return category;
    if (normalizedRegex && normalizedRegex.test(normalized)) return category;
  }
  return "Khác";
}

const INCOME_CATEGORY_RULES: Array<[RegExp, string, RegExp?]> = [
  [/\b(lương|salary|payroll)\b/i, "Lương", /\b(luong|salary|payroll)\b/i],
  [/\b(thưởng|bonus)\b/i, "Thưởng", /\b(thuong|bonus)\b/i],
  [/\b(lãi|cổ tức|dividend)\b/i, "Lãi/ Cổ tức", /\b(lai|co tuc|dividend)\b/i],
  [/\b(hoàn tiền|cashback|refund)\b/i, "Hoàn tiền", /\b(hoan tien|cashback|refund)\b/i],
  [/\b(bán hàng|bán|doanh thu)\b/i, "Bán hàng", /\b(ban hang|ban|doanh thu)\b/i],
  [/\b(freelance|dự án|project)\b/i, "Freelance", /\b(freelance|du an|project)\b/i],
  [/\b(quà tặng|tặng)\b/i, "Quà tặng", /\b(qua tang|tang)\b/i],
];

export function guessIncomeCategory(text: string): string {
  const value = text.toLowerCase();
  const normalized = normalizeText(value);
  for (const [regex, category, normalizedRegex] of INCOME_CATEGORY_RULES) {
    if (regex.test(value)) return category;
    if (normalizedRegex && normalizedRegex.test(normalized)) return category;
  }
  return "Thu nhập khác";
}

const VN_DIGITS = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];

function readGroup(group: number, showZeroInt: boolean): string {
  let res = "";
  const h = Math.floor(group / 100);
  const t = Math.floor((group % 100) / 10);
  const u = group % 10;

  if (h > 0 || showZeroInt) {
    res += VN_DIGITS[h] + " trăm ";
    if (t === 0 && u !== 0) res += "linh ";
  }

  if (t > 0 && t !== 1) {
    res += VN_DIGITS[t] + " mươi ";
    if (t > 0 && u === 1) res += ""; // Handled below
  } else if (t === 1) {
    res += "mười ";
  }

  if (u !== 0) {
    if (u === 1 && t > 1) res += "mốt";
    else if (u === 5 && t > 0) res += "lăm";
    else if (u === 4 && t > 1) res += "tư";
    else res += VN_DIGITS[u];
  }

  return res.trim();
}

export function numberToVietnameseWords(n: number): string {
  if (n === 0) return "Không đồng";
  if (n < 0) return "Trừ " + numberToVietnameseWords(Math.abs(n)).toLowerCase();

  const groups: string[] = [];
  const units = ["", "nghìn", "triệu", "tỷ", "nghìn tỷ", "triệu tỷ", "tỷ tỷ"];
  let temp = Math.floor(n);
  let unitIdx = 0;

  while (temp > 0) {
    const group = temp % 1000;
    if (group > 0) {
      const s = readGroup(group, temp >= 1000);
      groups.unshift(s + (units[unitIdx] ? " " + units[unitIdx] : ""));
    }
    temp = Math.floor(temp / 1000);
    unitIdx++;
  }

  const result = groups.join(" ").trim();
  return result.charAt(0).toUpperCase() + result.slice(1) + " đồng";
}
