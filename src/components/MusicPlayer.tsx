import React, { useState, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';

interface Track {
  id: string;
  title: string;
  img: string;
  streamUrl?: string;
}

const MusicPlayer: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const searchTracks = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Empty search",
        description: "Please enter a search term.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await fetch(`https://musicapi.x007.workers.dev/search?q=${encodeURIComponent(searchQuery)}&searchEngine=gaama`);
      
      if (!response.ok) {
        throw new Error('Search failed');
      }
      
      const data = await response.json();
      
      if (!data.response || data.response.length === 0) {
        toast({
          title: "No results found",
          description: "Try a different search term.",
        });
        return;
      }
      
      setTracks(data.response);
    } catch (error) {
      console.error('Error searching tracks:', error);
      toast({
        title: "Error searching tracks",
        description: "Could not search for tracks. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStreamUrl = async (trackId: string) => {
    try {
      const response = await fetch(`https://musicapi.x007.workers.dev/fetch?id=${trackId}`);
      if (!response.ok) {
        throw new Error('Failed to get stream URL');
      }
      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Error getting stream URL:', error);
      throw error;
    }
  };

  const playTrack = async (track: Track) => {
    try {
      if (!track.streamUrl) {
        const streamUrl = await getStreamUrl(track.id);
        track.streamUrl = streamUrl;
      }

      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audio = new Audio(track.streamUrl);
      audioRef.current = audio;

      audio.volume = volume / 100;
      audio.play();

      audio.addEventListener('timeupdate', () => {
        if (audio.duration) {
          setProgress((audio.currentTime / audio.duration) * 100);
        }
      });

      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        setProgress(0);
      });

      setCurrentTrack(track);
      setIsPlaying(true);

      // Update the music state in Supabase
      try {
        await supabase
          .from('music_state')
          .upsert({
            track_id: track.id,
            track_name: track.title,
            artist_name: 'Unknown', // API doesn't provide artist info
            album_name: 'Unknown', // API doesn't provide album info
            album_image: track.img,
            uri: track.streamUrl,
            is_playing: true,
            position: 0
          });
      } catch (error) {
        console.error('Supabase update error:', error);
      }
    } catch (error) {
      console.error('Error playing track:', error);
      toast({
        title: "Error playing track",
        description: "Could not play the track. Please try again.",
        variant: "destructive",
      });
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    
    setIsPlaying(!isPlaying);

    // Update the music state in Supabase
    try {
      supabase
        .from('music_state')
        .upsert({
          is_playing: !isPlaying,
          track_id: currentTrack?.id || '',
          track_name: currentTrack?.title || '',
          artist_name: 'Unknown',
          album_name: 'Unknown',
          album_image: currentTrack?.img || '',
          uri: currentTrack?.streamUrl || ''
        });
    } catch (error) {
      console.error('Error updating Supabase:', error);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
  };

  return (
    <div className="music-player bg-anonymous-bg p-4 rounded-lg shadow-lg">
      <div className="search-section mb-4">
        <div className="flex gap-2">
          <Input
            placeholder="Search for songs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                searchTracks();
              }
            }}
            className="flex-1"
          />
          <Button onClick={searchTracks} disabled={isLoading}>
            <Search className="h-4 w-4 mr-2" />
            {isLoading ? 'Searching...' : 'Search'}
          </Button>
        </div>
      </div>

      <div className="tracks-list mb-4 max-h-60 overflow-y-auto">
        {tracks.length > 0 ? (
          tracks.map((track) => (
            <div
              key={track.id}
              className="track-item flex items-center p-2 hover:bg-anonymous-accent/10 rounded cursor-pointer"
              onClick={() => playTrack(track)}
            >
              <img src={track.img} alt={track.title} className="w-12 h-12 rounded mr-3" />
              <div>
                <div className="font-medium">{track.title}</div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-anonymous-text/70">
            Search for songs to start playing
          </div>
        )}
      </div>

      {currentTrack && (
        <div className="now-playing">
          <div className="flex items-center mb-4">
            <img src={currentTrack.img} alt={currentTrack.title} className="w-16 h-16 rounded mr-4" />
            <div>
              <div className="font-medium">{currentTrack.title}</div>
            </div>
          </div>

          <div className="controls">
            <div className="flex items-center justify-center gap-4 mb-2">
              <Button variant="ghost" size="icon">
                <SkipBack className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={togglePlayPause}>
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>
              <Button variant="ghost" size="icon">
                <SkipForward className="h-5 w-5" />
              </Button>
            </div>

            <div className="progress-bar mb-2">
              <Slider
                value={[progress]}
                max={100}
                step={1}
                className="w-full"
              />
            </div>

            <div className="volume-control flex items-center gap-2">
              <Volume2 className="h-4 w-4" />
              <Slider
                value={[volume]}
                max={100}
                step={1}
                onValueChange={handleVolumeChange}
                className="w-24"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MusicPlayer; 