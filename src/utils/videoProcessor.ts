import * as FileSystem from 'expo-file-system';
import * as VideoThumbnails from 'expo-video-thumbnails';

export interface ExtractedFrame {
  timestamp: number;
  base64: string;
  mimeType: string;
}

export async function downloadVideo(url: string, progressCallback?: (progress: number) => void): Promise<string> {
  const filename = url.split('/').pop()?.split('?')[0] || `video_${Date.now()}.mp4`;
  // @ts-ignore - Types missing in current expo-file-system version
  const fileUri = `${FileSystem.cacheDirectory}${filename}`;

  const downloadResumable = FileSystem.createDownloadResumable(
    url,
    fileUri,
    {},
    (downloadProgress) => {
      const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
      if (progressCallback) progressCallback(progress);
    }
  );

  try {
    const result = await downloadResumable.downloadAsync();
    if (!result || !result.uri) throw new Error('Failed to download video');
    return result.uri;
  } catch (e) {
    throw e;
  }
}

export async function extractFrames(
  fileUri: string,
  durationMs: number,
  maxFramesToExtract: number = 30
): Promise<ExtractedFrame[]> {
  const frames: ExtractedFrame[] = [];
  
  if (durationMs <= 0) return frames;

  const stepMs = Math.max(500, Math.floor(durationMs / maxFramesToExtract));
  
  const timestamps = [];
  for (let t = 0; t < durationMs; t += stepMs) {
    timestamps.push(t);
  }
  if (timestamps[timestamps.length - 1] !== durationMs - 100) {
    timestamps.push(durationMs - 100 > 0 ? durationMs - 100 : 0);
  }

  for (const timeMs of timestamps) {
    try {
      const { uri } = await VideoThumbnails.getThumbnailAsync(fileUri, {
        time: timeMs,
        quality: 0.5,
      });
      
      // @ts-ignore
      const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
      
      frames.push({
        timestamp: timeMs / 1000,
        base64,
        mimeType: 'image/jpeg'
      });
      
      await FileSystem.deleteAsync(uri, { idempotent: true });
    } catch (e) {
      // Ignore individual frame extraction failures
    }
  }

  return frames;
}

export async function cleanupVideo(fileUri: string) {
  try {
    await FileSystem.deleteAsync(fileUri, { idempotent: true });
  } catch (e) {
  }
}
