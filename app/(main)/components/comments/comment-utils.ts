const relativeTimeFormatter = new Intl.RelativeTimeFormat("vi", {
  numeric: "auto",
});

export const commentNumberFormatter = new Intl.NumberFormat("vi-VN");

export function getCommentAuthorName(
  fullName: string | null | undefined,
  username: string,
) {
  return fullName?.trim() || username;
}

export function getCommentInitial(value: string) {
  return value.trim().charAt(0).toUpperCase() || "I";
}

export function formatCommentTime(value: string) {
  const timestamp = new Date(value).getTime();

  if (Number.isNaN(timestamp)) {
    return "Vừa xong";
  }

  const seconds = Math.round((timestamp - Date.now()) / 1000);
  const ranges: Array<[number, Intl.RelativeTimeFormatUnit]> = [
    [60, "second"],
    [60, "minute"],
    [24, "hour"],
    [7, "day"],
    [4.34524, "week"],
    [12, "month"],
  ];

  let duration = seconds;
  let unit: Intl.RelativeTimeFormatUnit = "second";

  for (const [amount, nextUnit] of ranges) {
    if (Math.abs(duration) < amount) {
      break;
    }

    duration /= amount;
    unit = nextUnit;
  }

  return relativeTimeFormatter.format(Math.round(duration), unit);
}
