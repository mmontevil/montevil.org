import slugify1 from "@sindresorhus/slugify";
import memoize from "fast-memoize";

const slugify0 = (string) => {
  return slugify1(string, {
    decamelize: false,
    customReplacements: [["%", " "]],
  });
};

const slugify = memoize(slugify0);

export default slugify;
