export type DomainError =
  | { readonly kind: 'IMAGE_NOT_FOUND'; readonly filename: string }
  | { readonly kind: 'INVALID_ETAG_MODE'; readonly value: string };

export function imageNotFound(filename: string): DomainError {
  return { kind: 'IMAGE_NOT_FOUND', filename };
}

export function invalidEtagMode(value: string): DomainError {
  return { kind: 'INVALID_ETAG_MODE', value };
}
