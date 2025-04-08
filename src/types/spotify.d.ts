declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: {
      Player: new (config: {
        name: string;
        getOAuthToken: (cb: (token: string) => void) => void;
        volume?: number;
      }) => {
        connect: () => Promise<boolean>;
        disconnect: () => void;
        addListener: (event: string, callback: (state: any) => void) => void;
        removeListener: (event: string, callback: (state: any) => void) => void;
        getCurrentState: () => Promise<any>;
        setName: (name: string) => Promise<void>;
        getVolume: () => Promise<number>;
        setVolume: (volume: number) => Promise<void>;
        pause: () => Promise<void>;
        resume: () => Promise<void>;
        togglePlay: () => Promise<void>;
        seek: (position: number) => Promise<void>;
        previousTrack: () => Promise<void>;
        nextTrack: () => Promise<void>;
        play: (options?: { uris?: string[]; offset?: { position: number } }) => Promise<void>;
      };
    };
  }
}

export {}; 