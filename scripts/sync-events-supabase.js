const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const eventsData = [
  {
    id: '11111111-1111-1111-1111-111111110001',
    title: 'พิธีปิดหลักสูตร YOUNG FTI ELITE รุ่นที่ 11',
    description: 'รวบรวมภาพกิจกรรม บรรยากาศความสนุก และความประทับใจตลอดงานพิธีปิดหลักสูตร YOUNG FTI ELITE รุ่นที่ 11 การมอบประกาศนียบัตร และฉลองจบหลักสูตร ณ โรงแรมเรเนซองส์ กรุงเทพ ราชประสงค์ จัดขึ้นเมื่อวันที่ 23 พฤษภาคม 2568',
    location_name: 'โรงแรมเรเนซองส์ กรุงเทพ ราชประสงค์ (Renaissance Bangkok Ratchaprasong)',
    google_maps_url: 'https://maps.app.goo.gl/renaissance-bangkok',
    start_time: '2025-05-24T18:00:00.000Z',
    end_time: '2025-05-24T22:30:00.000Z',
    reward_points: 150,
    reward_xp: 350,
    is_mandatory: true,
    status: 'COMPLETED'
  },
  {
    id: '11111111-1111-1111-1111-111111110002',
    title: 'ภาพบรรยากาศการอบรมโครงการ Young FTI Elite รุ่นที่ 11',
    description: 'ภาพบรรยากาศการสัมมนาและอบรมเชิงลึกเพื่อพัฒนาศักยภาพผู้บริหารและนักอุตสาหกรรมรุ่นใหม่ โดยคณาจารย์และวิทยากรผู้เชี่ยวชาญระดับประเทศ',
    location_name: 'สภาอุตสาหกรรมแห่งประเทศไทย (The Federation of Thai Industries)',
    google_maps_url: 'https://maps.app.goo.gl/fti-bangkok',
    start_time: '2025-05-17T09:00:00.000Z',
    end_time: '2025-05-17T17:00:00.000Z',
    reward_points: 100,
    reward_xp: 250,
    is_mandatory: true,
    status: 'COMPLETED'
  },
  {
    id: '11111111-1111-1111-1111-111111110003',
    title: 'กิจกรรม Y11 Friendship ณ Hard rock Maldives',
    description: 'ทริปกระชับมิตรและเปิดประสบการณ์ระดับนานาชาติ สานสัมพันธ์และแลกเปลี่ยนมุมมองธุรกิจระหว่างสมาชิก Young FTI Elite รุ่น 11 ณ Hard Rock Hotel Maldives',
    location_name: 'Hard Rock Hotel Maldives, South Malé Atoll, Maldives',
    google_maps_url: 'https://maps.app.goo.gl/hardrock-maldives',
    start_time: '2025-04-28T08:00:00.000Z',
    end_time: '2025-05-02T20:00:00.000Z',
    reward_points: 200,
    reward_xp: 500,
    is_mandatory: false,
    status: 'COMPLETED'
  },
  {
    id: '11111111-1111-1111-1111-111111110004',
    title: 'ศึกษาดูงาน บริษัท ธนากรผลิตภัณฑ์น้ำมันพืช จำกัด',
    description: 'การศึกษาดูงานนวัตกรรมกระบวนการสกัดและผลิตน้ำมันพืชมาตรฐานสากล พร้อมเรียนรู้การจัดการซัพพลายเชนและความยั่งยืนในภาคอุตสาหกรรมอาหาร',
    location_name: 'บริษัท ธนากรผลิตภัณฑ์น้ำมันพืช จำกัด (Thanakorn Vegetable Oil Products Co., Ltd.)',
    google_maps_url: 'https://maps.app.goo.gl/thanakorn-oil',
    start_time: '2025-04-05T09:00:00.000Z',
    end_time: '2025-04-05T16:00:00.000Z',
    reward_points: 100,
    reward_xp: 250,
    is_mandatory: false,
    status: 'COMPLETED'
  },
  {
    id: '11111111-1111-1111-1111-111111110005',
    title: 'กิจกรรมศึกษาดูงานต่างประเทศ ณ ประเทศฝรั่งเศส',
    description: 'ทริปการศึกษาดูงานนวัตกรรมอุตสาหกรรม แฟชั่น พลังงานสะอาด และเทคโนโลยีชั้นนำระดับสากล ณ กรุงปารีส ประเทศฝรั่งเศส',
    location_name: 'Paris, France (กรุงปารีส ประเทศฝรั่งเศส)',
    google_maps_url: 'https://maps.app.goo.gl/paris-france',
    start_time: '2025-03-17T09:00:00.000Z',
    end_time: '2025-03-23T18:00:00.000Z',
    reward_points: 250,
    reward_xp: 600,
    is_mandatory: false,
    status: 'COMPLETED'
  },
  {
    id: '11111111-1111-1111-1111-111111110006',
    title: 'กิจกรรมละลายพฤติกรรม Young FTI รุ่น 11 ณ พัทยา จ.ชลบุรี',
    description: 'กิจกรรมสร้างความคุ้นเคย ละลายพฤติกรรม (Ice Breaking) และแบ่งบ้านประจำกลุ่มเพื่อสร้างความสามัคคีและพลังเครือข่าย',
    location_name: 'Pattaya, Chonburi (พัทยา จ.ชลบุรี)',
    google_maps_url: 'https://maps.app.goo.gl/pattaya',
    start_time: '2025-01-27T09:00:00.000Z',
    end_time: '2025-01-29T17:00:00.000Z',
    reward_points: 150,
    reward_xp: 350,
    is_mandatory: true,
    status: 'COMPLETED'
  },
  {
    id: '11111111-1111-1111-1111-111111110007',
    title: 'พิธีเปิดหลักสูตร Young FTI ELITE รุ่นที่ 11 และปฐมนิเทศ',
    description: 'การเปิดตัวอย่างเป็นทางการ ปาฐกถาพิเศษจากประธานสภาอุตสาหกรรมแห่งประเทศไทย และการปฐมนิเทศผู้เข้าร่วมอบรมหลักสูตร Young FTI Elite รุ่นที่ 11',
    location_name: 'The Athenee Hotel Bangkok, A Luxury Collection Hotel',
    google_maps_url: 'https://maps.app.goo.gl/athenee-bangkok',
    start_time: '2025-01-18T09:00:00.000Z',
    end_time: '2025-01-18T18:00:00.000Z',
    reward_points: 150,
    reward_xp: 350,
    is_mandatory: true,
    status: 'COMPLETED'
  }
];

async function syncToSupabase() {
  console.log('Syncing ' + eventsData.length + ' events into Supabase table "events"...');

  for (const item of eventsData) {
    const { data: existing } = await supabase
      .from('events')
      .select('id, title')
      .eq('title', item.title)
      .maybeSingle();

    if (existing) {
      console.log('Updating existing event: ' + item.title + ' (id: ' + existing.id + ')');
      const { error } = await supabase
        .from('events')
        .update({
          description: item.description,
          location_name: item.location_name,
          google_maps_url: item.google_maps_url,
          start_time: item.start_time,
          end_time: item.end_time,
          reward_points: item.reward_points,
          reward_xp: item.reward_xp,
          is_mandatory: item.is_mandatory,
          status: item.status
        })
        .eq('id', existing.id);
      if (error) console.error('Update error:', error);
    } else {
      console.log('Inserting new event: ' + item.title);
      const { error } = await supabase
        .from('events')
        .insert([item]);
      if (error) console.error('Insert error:', error);
    }
  }

  const { data: allEvents } = await supabase.from('events').select('id, title, start_time, location_name');
  console.log('Supabase Events total:', allEvents ? allEvents.length : 0);
  console.log(allEvents);
}

syncToSupabase();
