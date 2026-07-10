import * as FileSystem from 'expo-file-system';
import * as VideoThumbnails from 'expo-video-thumbnails';

export interface ExtractedFrame {
  timestamp: number;
  base64: string;
  mimeType: string;
}

export async function downloadVideo(url: string, progressCallback?: (progress: number) => void): Promise<string> {
  const filename = url.split('/').pop()?.split('?')[0] || `video_${Date.now()}.mp4`;
  const fileUri = `${FileSystem.documentDirectory}${filename}`;

  try {
    // Call progress once to show starting
    if (progressCallback) progressCallback(0.1);

    // Using standard downloadAsync instead of Resumable to avoid legacy expo-file-system warnings
    const result = await FileSystem.downloadAsync(url, fileUri);
    
    if (progressCallback) progressCallback(1.0);

    if (!result || !result.uri) throw new Error('Failed to download video');
    return result.uri;
  } catch (e) {
    throw e;
  }
}

export async function extractFrames(
  fileUri: string,
  durationMs: number,
  maxFramesToExtract: number = 15 // Lowered from 30 to 15 for 2x faster performance
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

  // Process frames in parallel batches for significant speedup
  const batchSize = 3; 
  for (let i = 0; i < timestamps.length; i += batchSize) {
    const batch = timestamps.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async (timeMs) => {
      try {
        const { uri } = await VideoThumbnails.getThumbnailAsync(fileUri, {
          time: timeMs,
          quality: 0.5,
        });
        
        const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
        
        await FileSystem.deleteAsync(uri, { idempotent: true });

        return {
          timestamp: timeMs / 1000,
          base64,
          mimeType: 'image/jpeg'
        };
      } catch (e) {
        return null;
      }
    });

    const results = await Promise.all(batchPromises);
    for (const res of results) {
      if (res) frames.push(res);
    }
  }

  return frames.sort((a, b) => a.timestamp - b.timestamp);
}

export async function cleanupVideo(fileUri: string) {
  try {
    await FileSystem.deleteAsync(fileUri, { idempotent: true });
  } catch (e) {
  }
}
