const fs = require('fs');
const path = require('path');

const screenshotsDir = path.join(__dirname, '../screenshots');

// List of screens in logical grid layout
// Coordinates for a 4-column flow map
const screens = [
  // Row 1: Entry & Auth
  {
    id: 'login',
    file: '01_login_gate.png',
    title: '1. Login Gate',
    sub: 'ประตูคัดกรองสิทธิ์ (yfti11 / YFTI Admin)',
    tag: 'AUTH',
    x: 80,
    y: 80,
    w: 260,
    h: 578
  },
  {
    id: 'register',
    file: '16_register.png',
    title: '2. Register Page',
    sub: 'ลงทะเบียนสมาชิกใหม่ รออนุมัติ',
    tag: 'ONBOARDING',
    x: 80,
    y: 760,
    w: 260,
    h: 578
  },

  // Row 1 & 2: Member Core
  {
    id: 'home',
    file: '02_home_dashboard.png',
    title: '3. Home Dashboard',
    sub: 'ภาพรวมคะแนน, กิจกรรม, ดวงดาว Mars',
    tag: 'MEMBER CORE',
    x: 460,
    y: 80,
    w: 260,
    h: 578
  },
  {
    id: 'academy',
    file: '03_academy.png',
    title: '4. Academy & Missions',
    sub: 'วัดผลเข้าเรียน 80%, Leaderboard 9 บ้าน',
    tag: 'ACADEMY',
    x: 840,
    y: 80,
    w: 260,
    h: 578
  },
  {
    id: 'events',
    file: '04_events.png',
    title: '5. Events & Schedule',
    sub: 'ตารางอบรม & ซิงค์ Google Calendar',
    tag: 'EVENTS',
    x: 840,
    y: 760,
    w: 260,
    h: 578
  },
  {
    id: 'event_qr',
    file: '05_event_dynamic_qr_modal.png',
    title: '6. Dynamic QR Check-in',
    sub: 'Token สด 30 วิ ป้องกันการแคปภาพ',
    tag: 'MODAL',
    x: 1220,
    y: 760,
    w: 260,
    h: 578
  },

  // Row 3: Directory & Profile
  {
    id: 'directory',
    file: '06_directory.png',
    title: '7. Directory ทำเนียบรุ่น',
    sub: 'ค้นหาผู้บริหาร, ฟิลเตอร์แยก 9 บ้าน',
    tag: 'DIRECTORY',
    x: 840,
    y: 1440,
    w: 260,
    h: 578
  },
  {
    id: 'member_detail',
    file: '07_directory_member_detail.png',
    title: '8. Member Direct Connect',
    sub: 'โปรไฟล์เพื่อนร่วมรุ่น, โทร, LINE, LinkedIn',
    tag: 'NETWORKING',
    x: 1220,
    y: 1440,
    w: 260,
    h: 578
  },

  // Row 4: Profile & Governance
  {
    id: 'profile_front',
    file: '08_profile_card_front.png',
    title: '9. Digital Member Card',
    sub: 'บัตรสมาชิกดิจิทัล Executive Look',
    tag: 'PROFILE',
    x: 460,
    y: 760,
    w: 260,
    h: 578
  },
  {
    id: 'profile_back',
    file: '09_profile_card_back.png',
    title: '10. Digital Card (Back)',
    sub: 'พลิกหลังบัตรแสดง Personal QR',
    tag: 'INTERACTIVE',
    x: 460,
    y: 1440,
    w: 260,
    h: 578
  },
  {
    id: 'role_switcher',
    file: '10_profile_bento_role_switcher.png',
    title: '11. Role Permission Switcher',
    sub: 'สถิติ 85.7% และปุ่มสลับ Member / Admin',
    tag: 'GOVERNANCE',
    x: 80,
    y: 1440,
    w: 260,
    h: 578
  },

  // Row 5: Admin Operations
  {
    id: 'admin_console',
    file: '11_admin_console.png',
    title: '12. Staff Operations Console',
    sub: 'แดชบอร์ดเจ้าหน้าที่ & ตรวจการบ้านภารกิจ',
    tag: 'ADMIN ONLY',
    x: 80,
    y: 2120,
    w: 260,
    h: 578
  },
  {
    id: 'admin_scanner',
    file: '12_admin_staff_scanner_modal.png',
    title: '13. Staff QR Camera Scanner',
    sub: 'กล้องสแกน QR สด ตรวจสอบ Token เข้างาน',
    tag: 'STAFF TOOL',
    x: 460,
    y: 2120,
    w: 260,
    h: 578
  }
];

// Connecting lines / arrows definition
const connectors = [
  // Login to Home
  {
    from: 'login',
    to: 'home',
    fromAnchor: 'right',
    toAnchor: 'left',
    label: 'เข้าสู่ระบบ (Member: yfti11)',
    color: '#10B981',
    style: 'solid'
  },
  // Login to Register
  {
    from: 'login',
    to: 'register',
    fromAnchor: 'bottom',
    toAnchor: 'top',
    label: 'สมัครสมาชิกใหม่',
    color: '#64748B',
    style: 'dashed'
  },
  // Home to Academy
  {
    from: 'home',
    to: 'academy',
    fromAnchor: 'right',
    toAnchor: 'left',
    label: 'แท็บ 1: เมนู Academy',
    color: '#FB7170',
    style: 'solid'
  },
  // Home to Events
  {
    from: 'home',
    to: 'events',
    fromAnchor: 'bottom',
    toAnchor: 'left',
    label: 'แท็บ 2: เมนูกิจกรรม',
    color: '#FB7170',
    style: 'solid'
  },
  // Events to Event QR Modal
  {
    from: 'events',
    to: 'event_qr',
    fromAnchor: 'right',
    toAnchor: 'left',
    label: 'กดปุ่ม "เปิด QR เช็คชื่อ"',
    color: '#3B82F6',
    style: 'solid'
  },
  // Home to Directory
  {
    from: 'home',
    to: 'directory',
    fromAnchor: 'bottom',
    toAnchor: 'left',
    label: 'แท็บ 3: ทำเนียบธุรกิจ',
    color: '#FB7170',
    style: 'solid'
  },
  // Directory to Member Detail
  {
    from: 'directory',
    to: 'member_detail',
    fromAnchor: 'right',
    toAnchor: 'left',
    label: 'คลิกดูโปรไฟล์เพื่อนร่วมรุ่น',
    color: '#8B5CF6',
    style: 'solid'
  },
  // Home to Profile
  {
    from: 'home',
    to: 'profile_front',
    fromAnchor: 'bottom',
    toAnchor: 'top',
    label: 'แท็บ 4: บัตรโปรไฟล์สมาชิก',
    color: '#FB7170',
    style: 'solid'
  },
  // Profile Front to Back
  {
    from: 'profile_front',
    to: 'profile_back',
    fromAnchor: 'bottom',
    toAnchor: 'top',
    label: 'แตะที่บัตรเพื่อพลิกหลัง',
    color: '#F59E0B',
    style: 'solid'
  },
  // Profile Front to Role Switcher
  {
    from: 'profile_front',
    to: 'role_switcher',
    fromAnchor: 'left',
    toAnchor: 'top',
    label: 'เลื่อนดูเกณฑ์ 80% & สิทธิ์',
    color: '#64748B',
    style: 'solid'
  },
  // Role Switcher to Admin Console
  {
    from: 'role_switcher',
    to: 'admin_console',
    fromAnchor: 'bottom',
    toAnchor: 'top',
    label: 'กดปุ่มสลับสิทธิ์ "Super Admin"',
    color: '#EF4444',
    style: 'solid'
  },
  // Admin Console to Staff Scanner
  {
    from: 'admin_console',
    to: 'admin_scanner',
    fromAnchor: 'right',
    toAnchor: 'left',
    label: 'กดปุ่ม "เปิดกล้องสแกนหน้างาน"',
    color: '#EF4444',
    style: 'solid'
  }
];

// Helper to calculate coordinates
function getAnchor(screen, anchor) {
  if (anchor === 'right') return { x: screen.x + screen.w, y: screen.y + screen.h / 2 };
  if (anchor === 'left') return { x: screen.x, y: screen.y + screen.h / 2 };
  if (anchor === 'bottom') return { x: screen.x + screen.w / 2, y: screen.y + screen.h };
  if (anchor === 'top') return { x: screen.x + screen.w / 2, y: screen.y };
  return { x: screen.x + screen.w / 2, y: screen.y + screen.h / 2 };
}

// Generate HTML Flow
function generateHtml() {
  const html = `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <title>YFTI Connect - UX/UI Interactive Flow Board</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Prompt:wght@400;600;700;800&family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: #0F172A;
      color: #F8FAFC;
      font-family: 'Prompt', 'Inter', sans-serif;
      overflow: auto;
      min-width: 1700px;
      min-height: 2850px;
      position: relative;
      padding: 40px;
    }
    .header-bar {
      position: sticky;
      top: 0;
      left: 0;
      z-index: 100;
      background: rgba(15, 23, 42, 0.95);
      backdrop-filter: blur(12px);
      padding: 20px 30px;
      border-radius: 20px;
      border: 1px solid rgba(255,255,255,0.1);
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 40px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.4);
    }
    .header-bar h1 {
      font-size: 24px;
      font-weight: 800;
      background: linear-gradient(135deg, #FB7170, #FFD7D7, #DBDFFF);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 8px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .screen-card {
      position: absolute;
      background: #1E293B;
      border-radius: 24px;
      border: 2px solid #334155;
      padding: 12px;
      box-shadow: 0 15px 35px rgba(0,0,0,0.5);
      transition: transform 0.2s, border-color 0.2s;
      z-index: 10;
    }
    .screen-card:hover {
      transform: translateY(-4px) scale(1.02);
      border-color: #FB7170;
      box-shadow: 0 20px 45px rgba(251, 113, 112, 0.25);
    }
    .screen-img {
      width: 100%;
      height: auto;
      border-radius: 16px;
      display: block;
      border: 1px solid rgba(255,255,255,0.08);
    }
    .screen-meta {
      margin-top: 10px;
      padding: 0 4px;
    }
    .screen-title {
      font-size: 13px;
      font-weight: 700;
      color: #FFFFFF;
      margin-top: 4px;
    }
    .screen-sub {
      font-size: 11px;
      color: #94A3B8;
      margin-top: 2px;
      line-height: 1.3;
    }
    svg.canvas-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 5;
    }
    .line-label {
      font-size: 11px;
      font-weight: 700;
      fill: #FFFFFF;
      text-shadow: 0 2px 4px rgba(0,0,0,0.8);
      background: #1E293B;
    }
    .btn-action {
      background: #FB7170;
      color: white;
      border: none;
      padding: 10px 18px;
      border-radius: 12px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: background 0.2s;
    }
    .btn-action:hover {
      background: #e05e5d;
    }
  </style>
</head>
<body>

  <div class="header-bar">
    <div>
      <h1>YFTI Connect — Complete UX/UI Interactive Flow Map</h1>
      <p style="font-size: 13px; color: #94A3B8; margin-top: 4px;">
        ผังแสดงการเชื่อมโยงทุกหน้าจอและทุก Modal ระหว่าง Member, Guest และ Admin (สามารถเปิดใน Browser หรือ Drag ลง Figma)
      </p>
    </div>
    <div style="display: flex; gap: 12px;">
      <a href="./figma_flow_map.svg" download class="btn-action">
        <span>⬇️ ดาวน์โหลด Vector SVG สำหรับ Figma</span>
      </a>
    </div>
  </div>

  <svg class="canvas-overlay" viewBox="0 0 1600 2800">
    <defs>
      <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#FB7170" />
      </marker>
      <marker id="arrow-green" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#10B981" />
      </marker>
      <marker id="arrow-blue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#3B82F6" />
      </marker>
      <marker id="arrow-purple" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#8B5CF6" />
      </marker>
      <marker id="arrow-red" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#EF4444" />
      </marker>
      <marker id="arrow-amber" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#F59E0B" />
      </marker>
    </defs>

    ${connectors.map(c => {
      const fromScreen = screens.find(s => s.id === c.from);
      const toScreen = screens.find(s => s.id === c.to);
      const p1 = getAnchor(fromScreen, c.fromAnchor);
      const p2 = getAnchor(toScreen, c.toAnchor);
      const dx = (p2.x - p1.x) * 0.5;
      const dy = (p2.y - p1.y) * 0.5;
      const c1x = p1.x + (c.fromAnchor === 'right' ? 80 : c.fromAnchor === 'left' ? -80 : 0);
      const c1y = p1.y + (c.fromAnchor === 'bottom' ? 80 : c.fromAnchor === 'top' ? -80 : 0);
      const c2x = p2.x + (c.toAnchor === 'left' ? -80 : c.toAnchor === 'right' ? 80 : 0);
      const c2y = p2.y + (c.toAnchor === 'top' ? -80 : c.toAnchor === 'bottom' ? 80 : 0);

      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2 - 12;

      let markerId = 'arrow';
      if (c.color === '#10B981') markerId = 'arrow-green';
      if (c.color === '#3B82F6') markerId = 'arrow-blue';
      if (c.color === '#8B5CF6') markerId = 'arrow-purple';
      if (c.color === '#EF4444') markerId = 'arrow-red';
      if (c.color === '#F59E0B') markerId = 'arrow-amber';

      return `
        <path d="M ${p1.x} ${p1.y} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}" 
              fill="none" 
              stroke="${c.color}" 
              stroke-width="3" 
              stroke-dasharray="${c.style === 'dashed' ? '6,6' : 'none'}"
              marker-end="url(#${markerId})" />
        <rect x="${midX - 90}" y="${midY - 14}" width="180" height="22" rx="11" fill="#0F172A" stroke="${c.color}" stroke-width="1.5" />
        <text x="${midX}" y="${midY + 1}" text-anchor="middle" class="line-label" fill="${c.color}">${c.label}</text>
      `;
    }).join('\n')}
  </svg>

  ${screens.map(s => {
    return `
      <div class="screen-card" style="left: ${s.x}px; top: ${s.y}px; width: ${s.w}px;">
        <span class="badge" style="background: rgba(251, 113, 112, 0.2); color: #FB7170; border: 1px solid rgba(251, 113, 112, 0.4); margin-bottom: 8px;">
          ${s.tag}
        </span>
        <img class="screen-img" src="${s.file}" alt="${s.title}" />
        <div class="screen-meta">
          <div class="screen-title">${s.title}</div>
          <div class="screen-sub">${s.sub}</div>
        </div>
      </div>
    `;
  }).join('\n')}

</body>
</html>`;

  fs.writeFileSync(path.join(screenshotsDir, 'ux_ui_flow.html'), html, 'utf8');
  console.log('Generated screenshots/ux_ui_flow.html');
}

// Generate Figma-ready standalone SVG file
function generateSvg() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1650" height="2750" viewBox="0 0 1650 2750">
    <defs>
      <marker id="arrow-svg" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#FB7170" />
      </marker>
      <marker id="arrow-green-svg" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#10B981" />
      </marker>
      <marker id="arrow-blue-svg" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#3B82F6" />
      </marker>
      <marker id="arrow-purple-svg" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#8B5CF6" />
      </marker>
      <marker id="arrow-red-svg" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#EF4444" />
      </marker>
      <marker id="arrow-amber-svg" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#F59E0B" />
      </marker>
    </defs>

    <!-- Canvas Background -->
    <rect width="100%" height="100%" fill="#0F172A" />

    <!-- Connectors -->
    ${connectors.map(c => {
      const fromScreen = screens.find(s => s.id === c.from);
      const toScreen = screens.find(s => s.id === c.to);
      const p1 = getAnchor(fromScreen, c.fromAnchor);
      const p2 = getAnchor(toScreen, c.toAnchor);
      const c1x = p1.x + (c.fromAnchor === 'right' ? 80 : c.fromAnchor === 'left' ? -80 : 0);
      const c1y = p1.y + (c.fromAnchor === 'bottom' ? 80 : c.fromAnchor === 'top' ? -80 : 0);
      const c2x = p2.x + (c.toAnchor === 'left' ? -80 : c.toAnchor === 'right' ? 80 : 0);
      const c2y = p2.y + (c.toAnchor === 'top' ? -80 : c.toAnchor === 'bottom' ? 80 : 0);
      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2 - 12;

      let markerId = 'arrow-svg';
      if (c.color === '#10B981') markerId = 'arrow-green-svg';
      if (c.color === '#3B82F6') markerId = 'arrow-blue-svg';
      if (c.color === '#8B5CF6') markerId = 'arrow-purple-svg';
      if (c.color === '#EF4444') markerId = 'arrow-red-svg';
      if (c.color === '#F59E0B') markerId = 'arrow-amber-svg';

      return `
        <g id="connector-${c.from}-to-${c.to}">
          <path d="M ${p1.x} ${p1.y} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}" 
                fill="none" 
                stroke="${c.color}" 
                stroke-width="3" 
                stroke-dasharray="${c.style === 'dashed' ? '6,6' : 'none'}"
                marker-end="url(#${markerId})" />
          <rect x="${midX - 95}" y="${midY - 14}" width="190" height="24" rx="12" fill="#1E293B" stroke="${c.color}" stroke-width="1.5" />
          <text x="${midX}" y="${midY + 3}" text-anchor="middle" font-family="'Prompt', sans-serif" font-size="11" font-weight="bold" fill="#FFFFFF">${c.label}</text>
        </g>
      `;
    }).join('\n')}

    <!-- Screens -->
    ${screens.map(s => {
      const filePath = path.join(screenshotsDir, s.file);
      let imgBase64 = '';
      if (fs.existsSync(filePath)) {
        imgBase64 = fs.readFileSync(filePath).toString('base64');
      }

      return `
        <g id="frame-${s.id}" transform="translate(${s.x}, ${s.y})">
          <!-- Card Container -->
          <rect width="${s.w}" height="${s.h}" rx="20" fill="#1E293B" stroke="#334155" stroke-width="2" />
          
          <!-- Screen Image -->
          <image href="data:image/png;base64,${imgBase64}" x="10" y="10" width="${s.w - 20}" height="${s.h - 85}" preserveAspectRatio="xMidYMid slice" clip-path="inset(0 round 14px)" />
          
          <!-- Badge -->
          <rect x="12" y="${s.h - 68}" width="70" height="18" rx="6" fill="#FB7170" fill-opacity="0.2" stroke="#FB7170" stroke-width="0.8" />
          <text x="47" y="${s.h - 55}" text-anchor="middle" font-family="'Prompt', sans-serif" font-size="9" font-weight="bold" fill="#FB7170">${s.tag}</text>

          <!-- Title & Sub -->
          <text x="12" y="${s.h - 32}" font-family="'Prompt', sans-serif" font-size="12" font-weight="bold" fill="#FFFFFF">${s.title}</text>
          <text x="12" y="${s.h - 14}" font-family="'Prompt', sans-serif" font-size="9" fill="#94A3B8">${s.sub}</text>
        </g>
      `;
    }).join('\n')}

  </svg>`;

  fs.writeFileSync(path.join(screenshotsDir, 'figma_flow_map.svg'), svg, 'utf8');
  console.log('Generated screenshots/figma_flow_map.svg');
}

generateHtml();
generateSvg();
