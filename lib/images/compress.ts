import imageCompression from 'browser-image-compression';

export async function compressImage(file: File) {
  const options = {
    maxSizeMB: 0.2,
    maxWidthOrHeight: 900,
    useWebWorker: true,
  };

  const compressedBlob = await imageCompression(file, options);
  const ext = (compressedBlob.type.split('/')[1] || 'jpg').replace(
    /[^a-z0-9]/gi,
    '',
  );
  const name = `${crypto.randomUUID()}.${ext}`;
  return new File([compressedBlob], name, {
    type: compressedBlob.type,
    lastModified: Date.now(),
  });
}
