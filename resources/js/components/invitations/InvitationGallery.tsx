import Splide from '@splidejs/splide';
import {AutoScroll} from '@splidejs/splide-extension-auto-scroll';
import {Pause, Play} from 'lucide-react';
import {useEffect, useRef, useState} from 'react';
import '@splidejs/splide/css';

type Photo = { src: string; alt: string };
const i18n = {
    prev: 'Fotografia anterior',
    next: 'Fotografia seguinte',
    first: 'Primeira fotografia',
    last: 'Última fotografia',
    slideX: 'Ir para a fotografia %s',
    pageX: 'Ir para a página %s',
    play: 'Iniciar movimento',
    pause: 'Pausar movimento',
    carousel: 'galeria',
    slide: 'fotografia',
    select: 'Escolha uma fotografia',
    slideLabel: '%s de %s',
};

export default function InvitationGallery({photos}: { photos: Photo[] }) {
    const mainRef = useRef<HTMLDivElement>(null);
    const thumbnailsRef = useRef<HTMLDivElement>(null);
    const instanceRef = useRef<Splide | null>(null);
    const [paused, setPaused] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const pausedRef = useRef(paused);
    useEffect(() => {
        if (photos.length < 2 || !mainRef.current || !thumbnailsRef.current) return;
        const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
        const main = new Splide(mainRef.current, {
            type: 'loop', perPage: 1, perMove: 1, focus: 'center', gap: '24px', padding: '18%',
            drag: 'free', snap: true, pagination: false, keyboard: 'focused', speed: 650,
            autoScroll: {
                speed: 0.6,
                autoStart: !pausedRef.current && !motion.matches,
                pauseOnHover: true,
                pauseOnFocus: true
            },
            reducedMotion: {speed: 0, rewindSpeed: 0, autoScroll: false},
            breakpoints: {768: {padding: '12%', gap: '16px'}, 480: {padding: '9%', gap: '10px'}},
            i18n,
        });
        const thumbnails = new Splide(thumbnailsRef.current, {
            fixedWidth: 88, fixedHeight: 68, gap: 10, rewind: true, pagination: false, arrows: false,
            isNavigation: true, focus: 'center', keyboard: 'focused', slideFocus: true,
            breakpoints: {480: {fixedWidth: 64, fixedHeight: 52, gap: 8}}, i18n,
        });
        main.sync(thumbnails);
        // Auto Scroll updates the active slide without a normal move event.
        main.on('active', () => {
            if (thumbnails.index !== main.index) thumbnails.go(main.index);
        });
        thumbnails.mount();
        main.mount({AutoScroll});
        instanceRef.current = main;
        const reduceMotion = () => {
            if (motion.matches) {
                main.Components.AutoScroll?.pause();
                pausedRef.current = true;
                setPaused(true);
            }
        };
        motion.addEventListener('change', reduceMotion);
        return () => {
            motion.removeEventListener('change', reduceMotion);
            main.destroy(true);
            thumbnails.destroy(true);
            instanceRef.current = null;
        };
    }, [photos]);
    const toggle = () => {
        const next = !paused;
        pausedRef.current = next;
        setPaused(next);
        const scroll = instanceRef.current?.Components.AutoScroll;
        if (next) scroll?.pause(); else scroll?.play();
    };
    if (!photos.length) return null;
    if (photos.length === 1) return <figure className="invitation-gallery-single"><img src={photos[0].src}
                                                                                       alt={photos[0].alt}
                                                                                       loading="lazy"/></figure>;
    return <div className="invitation-gallery">
        <div ref={mainRef} className="splide invitation-gallery-main" aria-label="Fotografias dos noivos">
            <div className="splide__track">
                <ul className="splide__list">
                    {photos.map((photo, index) => <li className="splide__slide" key={`${photo.src}-${index}`}><img
                        src={photo.src} alt={photo.alt} loading="lazy" decoding="async"/></li>)}
                </ul>
            </div>
        </div>
        <div className="invitation-gallery-controls">
            <p>As memórias que queremos partilhar consigo</p>
            <button type="button" onClick={toggle} aria-pressed={paused}
                    aria-label={paused ? 'Iniciar movimento das fotografias' : 'Pausar movimento das fotografias'}>
                {paused ? <Play size={16}/> : <Pause size={16}/>} {paused ? 'Reproduzir' : 'Pausar'}
            </button>
        </div>
        <div ref={thumbnailsRef} className="splide invitation-gallery-thumbnails"
             aria-label="Escolha uma fotografia nas miniaturas">
            <div className="splide__track">
                <ul className="splide__list">
                    {photos.map((photo, index) => <li className="splide__slide" key={`${photo.src}-${index}`}><img
                        src={photo.src} alt={`Miniatura ${index + 1}: ${photo.alt}`} loading="lazy" decoding="async"/>
                    </li>)}
                </ul>
            </div>
        </div>
    </div>;
}
