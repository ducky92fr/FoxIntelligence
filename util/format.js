exports.formatHour = el => {
  const hour = el
    .trim()
    .split("h")
    .join(":");
  return hour;
};

exports.formatDate = el => {
  const date = new Date(
    el
      .split("/")
      .reverse()
      .join("-")
  )
    .toISOString()
    .replace("T", " ");
  return date;
};

exports.formatMoney = el => {
  let money = el
    .trim()
    .split(" ")[0]
    .replace(",", ".");
  return Number(money);
};
