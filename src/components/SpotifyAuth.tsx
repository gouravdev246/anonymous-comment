import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const SPOTIFY_CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const SPOTIFY_REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;
const SPOTIFY_AUTH_URL = `https://accounts.spotify.com/authorize?client_id=${SPOTIFY_CLIENT_ID}&response_type=token&redirect_uri=${SPOTIFY_REDIRECT_URI}&scope=streaming%20user-read-email%20user-read-private%20user-read-playback-state%20user-modify-playback-state`;

const SpotifyAuth: React.FC = () => {
  const { toast } = useToast();

  useEffect(() => {
    // Check for access token in URL hash
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get('access_token');
      if (accessToken) {
        localStorage.setItem('spotify_token', accessToken);
        window.location.hash = '';
        toast({
          title: "Successfully connected to Spotify",
          description: "You can now use the music player.",
        });
      }
    }
  }, []);

  const handleLogin = () => {
    window.location.href = SPOTIFY_AUTH_URL;
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <h3 className="text-lg font-semibold mb-4">Connect to Spotify</h3>
      <Button onClick={handleLogin}>
        Login with Spotify
      </Button>
    </div>
  );
};

export default SpotifyAuth; 