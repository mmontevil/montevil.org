export const unprotect = (string) => {
  return string?.replaceAll("\\<br\\>", "<br>");
};

export const orphans = (string) =>
  string?.replace(/((.*)\s(.{1,5}))$/g, '$2 $3') || '';

export const urlize = (str, find, url, type = "default") => {
  let open = "“";
  let close = "”";

  if (type === "book") {
    open = "<i>";
    close = "</i>";
  }

  const reg = new RegExp(`(${open}.*${close})`, "gi");

  const str2 = str?.replace(reg, '<a href="XXXX">$1</a>');
  return str2?.replace("XXXX", url);
};

export const initials = (string) => {
  if (!string) return "";

  let res = string[0];
  const list = string
    .replaceAll("-", " ")
    .replaceAll("  ", " ")
    .split(" ");

  for (let i = 1; i < list.length; i++) {
    res += list[i][0];
  }

  return res;
};
