/**
 * Utility functions for debugging and redacting sensitive data
 */

export function redactSensitiveData(obj: any): any {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => redactSensitiveData(item));
  }

  const redacted = { ...obj };
  
  // Redact API keys and other sensitive data
  if (redacted.Authorization) {
    redacted.Authorization = redacted.Authorization.replace(/Bearer\s+.+/, 'Bearer [REDACTED]');
  }
  if (redacted.authorization) {
    redacted.authorization = redacted.authorization.replace(/Bearer\s+.+/, 'Bearer [REDACTED]');
  }
  if (redacted['api-key']) {
    redacted['api-key'] = '[REDACTED]';
  }
  if (redacted['x-api-key']) {
    redacted['x-api-key'] = '[REDACTED]';
  }
  if (redacted['X-API-Key']) {
    redacted['X-API-Key'] = '[REDACTED]';
  }
  if (redacted.apikey) {
    redacted.apikey = '[REDACTED]';
  }
  if (redacted.apiKey) {
    redacted.apiKey = '[REDACTED]';
  }
  if (redacted.key) {
    redacted.key = '[REDACTED]';
  }
  if (redacted.token) {
    redacted.token = '[REDACTED]';
  }
  if (redacted.password) {
    redacted.password = '[REDACTED]';
  }
  if (redacted.secret) {
    redacted.secret = '[REDACTED]';
  }

  // Recursively process nested objects
  for (const key in redacted) {
    if (typeof redacted[key] === 'object' && redacted[key] !== null) {
      redacted[key] = redactSensitiveData(redacted[key]);
    }
  }

  return redacted;
}

export interface AudioDebugInfo {
  fileInfo: {
    fileName: string;
    fileSize: number;
    fileType: string;
    filePath: string;
    objectUrl?: string;
  };
  audioElement: {
    src: string;
    readyState: number;
    networkState: number;
    error?: MediaError | null;
    duration: number;
    currentTime: number;
    volume: number;
    muted: boolean;
    paused: boolean;
    ended: boolean;
  };
  browserInfo: {
    userAgent: string;
    audioSupport: {
      mp3: boolean;
      wav: boolean;
      ogg: boolean;
      aac: boolean;
      m4a: boolean;
    };
  };
  requestResponse?: {
    request: any;
    response: any;
  };
}

export function createAudioDebugInfo(
  file: File | null,
  audioElement: HTMLAudioElement | null,
  requestResponse?: { request: any; response: any }
): AudioDebugInfo {
  const audioSupport = {
    mp3: !!audioElement?.canPlayType('audio/mpeg'),
    wav: !!audioElement?.canPlayType('audio/wav'),
    ogg: !!audioElement?.canPlayType('audio/ogg'),
    aac: !!audioElement?.canPlayType('audio/aac'),
    m4a: !!audioElement?.canPlayType('audio/mp4'),
  };

  return {
    fileInfo: {
      fileName: file?.name || 'Unknown',
      fileSize: file?.size || 0,
      fileType: file?.type || 'Unknown',
      filePath: file?.webkitRelativePath || file?.name || 'Unknown',
      objectUrl: file ? URL.createObjectURL(file) : undefined,
    },
    audioElement: {
      src: audioElement?.src || 'No source',
      readyState: audioElement?.readyState || 0,
      networkState: audioElement?.networkState || 0,
      error: audioElement?.error || null,
      duration: audioElement?.duration || 0,
      currentTime: audioElement?.currentTime || 0,
      volume: audioElement?.volume || 0,
      muted: audioElement?.muted || false,
      paused: audioElement?.paused ?? true,
      ended: audioElement?.ended || false,
    },
    browserInfo: {
      userAgent: navigator.userAgent,
      audioSupport,
    },
    requestResponse: requestResponse ? {
      request: redactSensitiveData(requestResponse.request),
      response: redactSensitiveData(requestResponse.response),
    } : undefined,
  };
}