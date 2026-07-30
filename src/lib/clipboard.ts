export async function copyHtmlAndText(
  html: string,
  text: string
): Promise<{ success: boolean; message?: string }> {
  // Method 1: Modern ClipboardItem API (HTML + TSV plain text)
  if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
    try {
      const htmlBlob = new Blob([html], { type: 'text/html' });
      const textBlob = new Blob([text], { type: 'text/plain' });
      const item = new ClipboardItem({
        'text/html': htmlBlob,
        'text/plain': textBlob,
      });
      await navigator.clipboard.write([item]);
      return { success: true };
    } catch (e: any) {
      console.warn('ClipboardItem API failed, falling back to text copy:', e);
    }
  }

  // Method 2: navigator.clipboard.writeText
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return { success: true };
    } catch (e: any) {
      console.warn('navigator.clipboard.writeText failed:', e);
    }
  }

  // Method 3: Legacy execCommand fallback
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '-9999px';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textarea);
    if (successful) {
      return { success: true };
    }
  } catch (err: any) {
    console.error('execCommand copy failed:', err);
  }

  return {
    success: false,
    message: 'Could not access system clipboard. Please check browser permissions.',
  };
}
