import React, { useEffect, useRef } from 'react';
import { useContent } from '../context/ContentContext';

const AdPlacement = ({ slotId, format = 'auto', layoutKey }) => {
  const adRef = useRef(null);
  const { settings } = useContent();
  const publisherId = settings?.adsensePublisherId;

  useEffect(() => {
    try {
      if (window && window.adsbygoogle && adRef.current && publisherId) {
        // Prevent re-pushing to the same ad slot
        if (!adRef.current.hasAttribute('data-adsbygoogle-status')) {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        }
      }
    } catch (e) {
      console.error('AdSense push error', e);
    }
  }, [publisherId]);

  if (!publisherId) {
    return (
      <div className="w-full my-8 flex items-center justify-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-8 bg-slate-50/50 dark:bg-white/[0.02]">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Ad Placement Reservoir</p>
      </div>
    );
  }

  return (
    <div className="w-full my-8 flex items-center justify-center min-h-[90px] overflow-hidden">
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', minWidth: '100%', minHeight: '90px' }}
        data-ad-client={publisherId}
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive="true"
        {...(layoutKey && { 'data-ad-layout-key': layoutKey })}
      />
    </div>
  );
};

export default AdPlacement;
