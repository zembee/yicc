# YFTI Connect - Executive Cohort Community Web App (LINE LIFF)

แอปพลิเคชันคอมมูนิตี้และเน็ตเวิร์กกิ้งระดับผู้บริหารสำหรับใช้งานบน **LINE LIFF** โดยเฉพาะ (Mobile-First Web App)

---

## 🚀 ฟีเจอร์หลักในระบบ

### 1. LINE LIFF Authentication & Role-Based Access
- เชื่อมต่อกับ LINE SDK (`@line/liff`) ดึงรูปภาพ, ชื่อ, และ LINE User ID อัตโนมัติ
- สลับสิทธิ์และบทบาท (Member, House Admin, Super Admin)
- มี **Demo Mode** สำหรับพัฒนาและทดสอบบน Local Browser ได้ทันที

### 2. Academy Tab
- **Attendance Progress Tracker**: แถบวัดเปอร์เซ็นต์การเข้าเรียนสะสม
- **Locked Content Rule**: ล็อกเมนูเนื้อหาพิเศษ/Masterclass อัตโนมัติ หากเวลาเรียนน้อยกว่า 80%
- **House Leaderboard**: ตารางคะแนนรวมและอันดับการแข่งขันระหว่างบ้าน
- **Gamified Missions**: ภารกิจสะสมแต้ม (เช่น Seatmate Snap, Mentor Connect) พร้อมระบบอัปโหลดรูปภาพส่งการบ้าน

### 3. Events Tab
- รายการกิจกรรมสัมมนาและเวิร์กช็อป
- **Google Calendar 1-Click Sync**: กดปุ่มเดียวเพื่อสร้าง Event ลง Google Calendar ทันที
- **Dynamic Time-Based QR Check-in**: สร้าง QR Code เช็คชื่อที่มีอายุ 30 วินาที พร้อมรีเฟรช Token สด เพื่อป้องกันการแคปภาพหน้าจอส่งให้ผู้อื่น

### 4. Directory Tab
- ค้นหาทำเนียบผู้บริหาร (ค้นหาตามชื่อ, บริษัท, ตำแหน่ง, หรืออุตสาหกรรม)
- ตัวกรองแยกตามบ้าน (House Alpha, Phoenix, Pegasus, Titans)
- **Direct Connect Modal**: ปุ่มติดต่อด่วน (โทรศัพท์, แชท LINE โดยตรง, เปิดโปรไฟล์ LinkedIn)

### 5. Profile Tab
- แสดงรายละเอียดส่วนตัว, ยอด Coins และ XP
- ตารางสรุปการเข้าเรียน และสังกัดบ้าน
- **Role Switcher (Dev Tool)**: เครื่องมือสำหรับทดสอบสลับบทบาทเป็น Super Admin หรือ Member

### 6. Admin Console
- **กล้องสแกน QR Code หน้างาน (Staff Scanner)**: รองรับการสแกนผ่านกล้องสมาร์ทโฟน พร้อมตรวจจับความสดของเวลา (Timestamp Verification) และแสดงผลลัพธ์ทันที
- **Mission Review Dashboard**: ตรวจสอบภาพถ่ายภารกิจที่สมาชิกส่งเข้ามา พร้อมปุ่มอนุมัติ/ปฏิเสธ และแจกแต้ม

---

## 🛠️ วิธีการติดตั้งและรันโปรเจกต์

### 1. ติดตั้ง Dependencies
```bash
npm install
```

### 2. ตั้งค่าตัวแปรสภาพแวดล้อม (Environment Variables)
แก้ไขไฟล์ `.env.local`:
```env
NEXT_PUBLIC_LIFF_ID=your-line-liff-id
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. ตั้งค่า Database บน Supabase
คัดลอกคำสั่ง SQL จากไฟล์ [`supabase/schema.sql`](file:///Users/panmac/Documents/git/yicc/supabase/schema.sql) ไปรันใน **SQL Editor** บน Supabase Dashboard

### 4. รันเซิร์ฟเวอร์สำหรับทดสอบ
```bash
npm run dev
```
เปิดเบราว์เซอร์ไปที่ `http://localhost:3000`
