/**
 * These functions convert arbitrary CSS to URI-safe strings that are used
 * as data-URI virtual imports.
 */

export function encodeCSS(plainCSSString: string) {
  const binString = Array.from(
    new TextEncoder().encode(plainCSSString),
    (byte) => String.fromCodePoint(byte)
  ).join('');
  return encodeURIComponent(btoa(binString));
}

export function decodeCSS(encodedCSSString: string) {
  const binString = atob(decodeURIComponent(encodedCSSString));
  return new TextDecoder().decode(
    Uint8Array.from(binString, (m) => m.codePointAt(0) as number)
  );
}
