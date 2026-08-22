export function isValidCharacterName(value: string): boolean {
  return /^[\u3400-\u9fff]{1,4}$/u.test(value.trim())
}
