const ALLOWED_IMAGE_TYPES = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

export async function isAllowedFloorPlanImage(file) {
  const extension = `.${file?.name?.split('.').pop()?.toLowerCase() || ''}`;
  const expectedType = ALLOWED_IMAGE_TYPES[extension];

  if (!file || !expectedType || (file.type && file.type !== expectedType)) return false;

  const header = new Uint8Array(await file.slice(0, 1024).arrayBuffer());
  const headerText = new TextDecoder().decode(header);
  if (headerText.includes('%PDF-')) return false;

  if (extension === '.jpg' || extension === '.jpeg') {
    return header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff;
  }

  if (extension === '.png') {
    return [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every(
      (byte, index) => header[index] === byte
    );
  }

  return (
    extension === '.webp' &&
    headerText.slice(0, 4) === 'RIFF' &&
    headerText.slice(8, 12) === 'WEBP'
  );
}