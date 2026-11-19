type RpcErrorMatcher = (record: Record<string, unknown>, message: string) => boolean;

function containsRpcError(
  error: unknown,
  matcher: RpcErrorMatcher,
  seen = new Set<object>(),
  depth = 0
): boolean {
  if (depth > 6 || error == null) return false;
  if (typeof error === 'string') return matcher({}, error);
  if (typeof error !== 'object' || seen.has(error)) return false;
  seen.add(error);

  if (Array.isArray(error)) {
    return error.some(item => containsRpcError(item, matcher, seen, depth + 1));
  }

  const record = error as Record<string, unknown>;
  const message = `${String(record.message ?? '')} ${String(record.shortMessage ?? '')}`;
  if (matcher(record, message)) return true;

  return ['error', 'info', 'cause', 'value', 'data', 'payload'].some(key =>
    containsRpcError(record[key], matcher, seen, depth + 1)
  );
}

export function isRpcRateLimitError(error: unknown): boolean {
  return containsRpcError(
    error,
    (record, message) =>
      String(record.code) === '-32005' || /too many requests|rate.?limit/i.test(message)
  );
}

export function isIncompleteRpcResponse(error: unknown): boolean {
  return containsRpcError(
    error,
    (record, message) =>
      record.code === 'BAD_DATA' ||
      /missing response for request|incomplete response/i.test(message)
  );
}

export function getRpcErrorMessage(error: unknown, refreshAction: string): string {
  if (isRpcRateLimitError(error)) {
    return `The RPC provider is rate-limiting folder requests. No automatic retries were made; use ${refreshAction} after the limit clears.`;
  }

  if (isIncompleteRpcResponse(error)) {
    return `The RPC provider returned an incomplete response. Folder data could not be loaded. No automatic retries were made; use ${refreshAction} to try again later.`;
  }

  return `Folder data could not be loaded. No automatic retries were made; use ${refreshAction} to try again later.`;
}
