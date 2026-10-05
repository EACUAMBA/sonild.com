import {Music2, Pause, Play} from 'lucide-react';
import {type RefObject, useState} from 'react';

type Props = {
    src: string;
    title?: string | null;
    artist?: string | null;
    visible: boolean;
    audioRef: RefObject<HTMLAudioElement | null>;
};

export default function InvitationMusicPlayer({src, title, artist, visible, audioRef}: Props) {
    const [playing, setPlaying] = useState(false);
    const [error, setError] = useState(false);
    const toggle = async () => {
        const audio = audioRef.current;
        if (!audio) return;
        if (!audio.paused) {
            audio.pause();
            return;
        }
        setError(false);
        try {
            await audio.play();
        } catch {
            setError(true);
        }
    };
    return <>
        <audio ref={audioRef} src={src} loop preload="none"
               onPlaying={() => {
                   setPlaying(true);
                   setError(false);
               }}
               onPause={() => setPlaying(false)}
               onError={() => {
                   setPlaying(false);
                   setError(true);
               }}/>
        {visible && <aside className="invitation-music-player" aria-label="Música do convite">
            <span className={`invitation-music-disc${playing ? ' is-playing' : ''}`} aria-hidden="true"><Music2
                size={20}/></span>
            <div className="invitation-music-info">
                <strong title={title || undefined}>{title || 'Música do convite'}</strong>
                {artist && <span title={artist}>{artist}</span>}
                {error && <small role="status">Toque para tentar novamente</small>}
            </div>
            <button type="button" onClick={() => void toggle()}
                    aria-label={playing ? 'Pausar música' : 'Reproduzir música'}
                    title={playing ? 'Pausar música' : 'Reproduzir música'}>
                {playing ? <Pause size={18} aria-hidden="true"/> : <Play size={18} aria-hidden="true"/>}
            </button>
        </aside>}
    </>;
}
