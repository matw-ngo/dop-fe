/**
 * Lead Source Tracking Component
 * Tracks how leads were acquired
 */

'use client';

import React, { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';

interface LeadSourceTrackingProps {
  source?: {
    source: string;
    medium?: string;
    campaign?: string;
    content?: string;
    keyword?: string;
  };
}

const LeadSourceTracking: React.FC<LeadSourceTrackingProps> = ({ source }) => {
  const { setValue } = useFormContext();

  useEffect(() => {
    // Auto-detect source from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const detectedSource = {
      utm_source: urlParams.get('utm_source') || source?.source || 'direct',
      utm_medium: urlParams.get('utm_medium') || source?.medium || 'organic',
      utm_campaign: urlParams.get('utm_campaign') || source?.campaign,
      utm_content: urlParams.get('utm_content') || source?.content,
      utm_keyword: urlParams.get('utm_keyword') || source?.keyword,
      referrer: document.referrer || 'direct',
      landing_page: window.location.pathname,
      user_agent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    };

    // Store source information
    setValue('source', detectedSource);
  }, [source, setValue]);

  return null; // This component doesn't render anything visible
};

export default LeadSourceTracking;