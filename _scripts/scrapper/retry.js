export async function retry(fn, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (e) {
      if (i === retries - 1) throw e;
      await new Promise(r =>
        setTimeout(r, 3000 + Math.random() * 3000)
      );
    }
  }
}