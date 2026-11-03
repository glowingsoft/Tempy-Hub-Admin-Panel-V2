export function base64ToFile(dataUrl, filename = 'manager-signature.png') {
  if (!dataUrl || typeof dataUrl !== 'string') {
    throw new Error('Invalid signature data: input is empty or not a string.');
  }

  let mimeType = 'image/png';
  let base64Data = dataUrl;

  const dataUriMatch = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (dataUriMatch) {
    mimeType = dataUriMatch[1].toLowerCase();
    base64Data = dataUriMatch[2];
  } else if (dataUrl.includes(',')) {
    const [header, payload] = dataUrl.split(',');
    const headerMimeMatch = header.match(/:(.*?);/);
    if (headerMimeMatch) {
      mimeType = headerMimeMatch[1].toLowerCase();
    }
    base64Data = payload || '';
  }

  if (mimeType !== 'image/png') {
    throw new Error(`Invalid signature MIME type: expected "image/png", but received "${mimeType}".`);
  }

  let byteCharacters;
  try {
    byteCharacters = atob(base64Data.trim());
  } catch (err) {
    throw new Error('Invalid Base64 signature data: decoding failed.');
  }

  const byteArray = new Uint8Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i += 1) {
    byteArray[i] = byteCharacters.charCodeAt(i);
  }

  return new File([byteArray], filename, {
    type: 'image/png',
    lastModified: Date.now(),
  });
}
