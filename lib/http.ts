type RetryOptions = {
  retries?: number;
  backoffMs?: number;
};

export const fetchWithTimeout = async (
  input: RequestInfo,
  init: RequestInit & { timeoutMs?: number } = {},
) => {
  const { timeoutMs = 12000, ...rest } = init;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(input, {
      ...rest,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(id);
  }
};

export const withRetry = async <T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
) => {
  const { retries = 2, backoffMs = 400 } = options;
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        await new Promise((resolve) =>
          setTimeout(resolve, backoffMs * (attempt + 1)),
        );
      }
    }
  }

  throw lastError;
};
