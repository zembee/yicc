'use client';

import React from 'react';
import { ParticipantDetailView } from '@/components/directory/ParticipantDetailView';

export default function YftiParticipantDetailPage({ params }: { params: { id: string } }) {
  return <ParticipantDetailView idOrSlug={params.id} />;
}
