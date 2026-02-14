const locks = new Map<string, Promise<void>>();

/**
 * Execute an async function with a file-level lock to prevent
 * concurrent writes from corrupting JSON data files.
 */
export async function withFileLock<T>(
  filePath: string,
  fn: () => Promise<T>
): Promise<T> {
  // Wait for any existing lock on this file
  while (locks.has(filePath)) {
    await locks.get(filePath);
  }

  let resolve!: () => void;
  const promise = new Promise<void>((r) => {
    resolve = r;
  });
  locks.set(filePath, promise);

  try {
    return await fn();
  } finally {
    locks.delete(filePath);
    resolve();
  }
}
