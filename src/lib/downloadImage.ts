/**
 * Generates a timestamped filename for the download
 */
export function generateDownloadFilename(): string {
  return `wave-function-collapse-${Date.now()}.png`;
}

/**
 * Downloads an image from a canvas element
 */
export function downloadCanvasAsImage(
  canvas: HTMLCanvasElement | null,
  filename = 'pattern.png'
): void {
  if (!canvas) {
    console.error('Canvas element not found');
    return;
  }

  try {
    // Convert canvas to data URL
    const dataURL = canvas.toDataURL('image/png');

    // Create a temporary anchor element
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataURL;

    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error downloading image:', error);
  }
}
