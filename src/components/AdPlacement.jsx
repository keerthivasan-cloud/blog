import React, { useEffect, useRef } from 'react';

const AdPlacement = ({ slotId, format = 'auto', layoutKey }) => {
  const adRef = useRef(null);

  useEffect(() => {
    try {
      if (window && window.adsbygoogle && adRef.current) {
        // Prevent re-pushing to the same ad slot
        if (!adRef.current.hasAttribute('data-adsbygoogle-status')) {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        }
      }
    } catch (e) {
      console.error('AdSense push error', e);
    }
  }, []);

  return (
    <div className="w-full my-8 flex items-center justify-center min-h-[90px] overflow-hidden">
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', minWidth: '100%' }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXX" // Should be dynamic in full implementation
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive="true"
        {...(layoutKey && { 'data-ad-layout-key': layoutKey })}
      />
    </div>
  );
};

export default AdPlacement;
