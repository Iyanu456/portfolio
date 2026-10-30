declare module "sanitize-html" {
  type TransformOptions = {
    [key: string]: unknown;
  };

  function sanitizeHtml(input: string, options?: TransformOptions): string;

  namespace sanitizeHtml {
    const defaults: {
      allowedTags: string[];
      allowedAttributes: Record<string, string[]>;
    };

    function simpleTransform(
      tagName: string,
      attribs?: Record<string, string>,
      merge?: boolean
    ): unknown;
  }

  export default sanitizeHtml;
}
