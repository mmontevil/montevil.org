

export  const divRemove =  (content) => {
  if (!content) return "";
  const regex = /(<div ((?!(>)).|\n)+>)|(<\/div>)/gm;
  return content.replace(regex, "");
};

export  const excerpt =  (content) => {
  if (content === undefined) {
    return "";
  }

  const regex = /(<p( [^>]*)?>((?!(<\/p>)).|\n)+<\/p>)/m;
  let excerpt = "";

  const cleanContent = content.replace(/<p><img [^>]+><\/p>/, "");
  const matches = regex.exec(cleanContent);

  if (matches !== null) {
    excerpt = matches[0].replace(
      /<p( [^>]*)?>(((?!(<\/p>)).|\n)+)<\/p>/,
      "$2"
    );
  }

  return excerpt;
};
