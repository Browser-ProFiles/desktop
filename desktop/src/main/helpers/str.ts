export const removeNullBytes = (str: string) => {
  return str.split("").filter(char => char.codePointAt(0)).join("")
}
