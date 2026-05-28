import { useEffect } from 'react';

interface VSLProps {
  mediaId: string;
  language?: 'en' | 'es';
}

export default function VSL({ mediaId, language = 'en' }: VSLProps) {
  useEffect(() => {
    const script1 = document.createElement('script');
    script1.src = 'https://fast.wistia.com/player.js';
    script1.async = true;
    document.body.appendChild(script1);

    const script2 = document.createElement('script');
    script2.src = `https://fast.wistia.com/embed/${mediaId}.js`;
    script2.async = true;
    script2.type = 'module';
    document.body.appendChild(script2);

    return () => {
      document.body.removeChild(script1);
      document.body.removeChild(script2);
    };
  }, [mediaId]);

  return (
    <div className="w-full">
      <style>{`
        wistia-player[media-id='${mediaId}']:not(:defined) {
          background: center / contain no-repeat url('https://fast.wistia.com/embed/medias/${mediaId}/swatch');
          display: block;
          filter: blur(5px);
          padding-top: 56.25%;
        }
      `}</style>
      <div className="rounded-2xl overflow-hidden shadow-2xl">
        <wistia-player media-id={mediaId} aspect="1.7777777777777777"></wistia-player>
      </div>
    </div>
  );
}
