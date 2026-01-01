

export default function linkCitations(content) {
  const idMap = {};
  const idCounters = {};

  /* ---------------- 0️⃣ NORMALISATION ---------------- */

  content = content
    .replace(/\s*\n\s*/g, " ")
    .replace(/[’‘]/g, "'")
    .replace(/&amp;/g, "&");

  /* ---------------- UTILITAIRES ---------------- */

  // ✅ VERSION CORRIGÉE — NE SPLIT PLUS SUR LES VIRGULES
  function getFirstAuthor(authorText) {
    authorText = authorText
      .replace(/&amp;/g, "&")
      .replace(/[’‘]/g, "'")
      .trim();

    const m = authorText.match(
      /^([A-ZÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ\-']+)/
    );
    return m ? m[1] : authorText;
  }

  function makeId(author, year) {
    return author.toLowerCase().replace(/[^a-z0-9]/g, "") + year;
  }

  function linkCitation(text, author, year) {
    if (/<a\b/.test(text)) return text;
    const id = idMap[author + year] || makeId(author, year);
    return `<a href="#${id}">${text}</a>`;
  }

  /* ---------------- 1️⃣ BIBLIOGRAPHIE (IDS UNIQUEMENT) ---------------- */

  content = content.replace(
    /<li class="bibitem"\s*>([\s\S]*?)<\/li>/g,
    (full, inner) => {
      if (/id=/.test(full)) return full;

      const m = inner.match(
        /^([\wÀ-ÖØ-öø-ÿ.\-&',\s]+?)\s*\((\d{4}[a-z]?)\)/
      );
      if (!m) return full;

      const firstAuthor = getFirstAuthor(m[1]);
      const year = m[2];

      let id = makeId(firstAuthor, year);
      if (idCounters[id]) {
        idCounters[id]++;
        id += "-" + idCounters[id];
      } else {
        idCounters[id] = 1;
      }

      idMap[firstAuthor + year] = id;
      return `<li class="bibitem" id="${id}">${inner}</li>`;
    }
  );

  /* ---------------- PROTÉGER LA BIBLIOGRAPHIE ---------------- */

  const bibBlocks = [];
  content = content.replace(
    /<li class="bibitem"[\s\S]*?<\/li>/g,
    match => {
      bibBlocks.push(match);
      return `@@BIB${bibBlocks.length - 1}@@`;
    }
  );

  /* ---------------- 2️⃣ CITATIONS NON INLINE (PARENTHÈSES) ---------------- */

  content = content.replace(/\(([^)]+)\)/g, (full, inner) => {

    // 🔹 IGNORER les parenthèses qui contiennent Figures/Figure/Section ou déjà un lien <a>
    if (/\bFigure\b|\bFigures\b|\bSection\b/i.test(inner) || /<a\b/i.test(inner)) {
      return full;
    }

    // 🔑 SUPPRIMER "see" et "see also"
    inner = inner.replace(/\bsee also\b|\bsee\b|\bvoir\b/gi, '').trim();
    const parts = inner.split(/;\s*/);

    const linked = parts.map(part => {
      const m = part.match(
        /([\wÀ-ÖØ-öø-ÿ.\-&'\s,]+?(?:et al\.?|and [\wÀ-ÖØ-öø-ÿ.'-]+|& [\wÀ-ÖØ-öø-ÿ.'-]+)?)\s*,?\s*(\d{4}[a-z]?)/i
      );
      if (!m) return part.trim();

      const firstAuthor = getFirstAuthor(m[1]);
      return linkCitation(m[0].trim(), firstAuthor, m[2]);
    });

    return `(${linked.join("; ")})`;
  });

  /* ---------------- 3️⃣ CITATIONS INLINE (Nom (année)) ---------------- */

  content = content.replace(
    /\b([A-ZÀ-ÖØ-öø-ÿ][\wÀ-ÖØ-öø-ÿ.'-]*(?:\s+(?:&|and)\s+[A-ZÀ-ÖØ-öø-ÿ][\wÀ-ÖØ-öø-ÿ.'-]*|\s+et al\.?)?)\s*\((\d{4}[a-z]?)\)/g,
    (full, authorText, year) => {
      const firstAuthor = getFirstAuthor(authorText);
      return linkCitation(full, firstAuthor, year);
    }
  );

  /* ---------------- RESTAURER LA BIBLIOGRAPHIE ---------------- */

  content = content.replace(/@@BIB(\d+)@@/g, (_, i) => bibBlocks[i]);

  return content;
}
