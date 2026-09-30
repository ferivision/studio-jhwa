export class ContentError extends Error {
  constructor(file: string, detail: string) {
    super(`Invalid content in content/${file}:\n${detail}`);
    this.name = "ContentError";
  }
}
