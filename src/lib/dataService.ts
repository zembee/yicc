import { supabase } from './supabase';
import { yftiParticipants, mockHouses, mockEvents, mockNews } from './mockData';
import { Participant, House, EventItem, NewsItem } from '@/types';

/**
 * Fetch all participants from Supabase Database (with local fallback)
 */
export async function getParticipants(): Promise<Participant[]> {
  try {
    const { data, error } = await supabase
      .from('participants')
      .select('*')
      .order('id', { ascending: false });

    if (!error && data && data.length > 0) {
      return data as Participant[];
    }
  } catch (err) {
    console.warn('Supabase DB fetch failed, falling back to local dataset:', err);
  }
  return yftiParticipants;
}

/**
 * Fetch all houses/constellations from Supabase Database
 */
export async function getHouses(): Promise<House[]> {
  try {
    const { data, error } = await supabase
      .from('houses')
      .select('*')
      .order('total_points', { ascending: false });

    if (!error && data && data.length > 0) {
      return data.map((h: any) => ({
        id: h.name.toLowerCase().replace(/\s+/g, '_'),
        name: h.name,
        color_hex: h.color_hex || '#3B82F6',
        total_points: h.total_points || 0,
        member_count: 14,
        rank: 1,
      }));
    }
  } catch (err) {
    console.warn('Supabase houses fetch failed, falling back:', err);
  }
  return mockHouses;
}

/**
 * Fetch news from Supabase Database
 */
export async function getNews(): Promise<NewsItem[]> {
  try {
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .order('date', { ascending: false });

    if (!error && data && data.length > 0) {
      return data as NewsItem[];
    }
  } catch (err) {
    console.warn('Supabase news fetch failed, falling back:', err);
  }
  return mockNews;
}
