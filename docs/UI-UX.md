# การออกแบบประสบการณ์และส่วนต่อประสานผู้ใช้ (UI/UX Design Specification)
## Smart Village Management System (VMS) — Modern Civic Workspace

อ้างอิงและผสานรวมมาตรฐานอย่างสมบูรณ์จาก [DESIGN.md](file:///d:/.PHONGPHAT/vms/vms/DESIGN.md)

---

## 1. ปรัชญาและแนวทางการออกแบบ (Creative North Star: "Modern Civic Workspace")

ระบบ **Smart Village Management System (VMS)** ปฏิวัติการออกแบบซอฟต์แวร์บริหารงานชุมชนและหมู่บ้านแบบดั้งเดิมที่มักจะดูอึดอัด รกตา และแห้งแล้ง โดยนำเสนอ **Modern Civic Workspace** ที่ผสมผสานความน่าเชื่อถือ ถูกต้อง แม่นยำของระบบงานหมู่บ้าน เข้ากับความนุ่มนวล เรียบหรู สงบตา และใช้งานง่ายของเครื่องมือดิจิทัลระดับพรีเมียมในศูนย์กลางเดียว

### ลักษณะเด่นทางสถาปัตยกรรม UI/UX (Key Characteristics):
- **Luminous & Friendly Civic Demeanor**: แทนที่สีเทาหม่นด้วยโทนสีหลัก **Civic Cobalt (`#3B82F6`)** ตัดกับพื้นผิวผืนกระดาษโปร่งเบาบนพื้นหลังละมุนตา **Canvas Base (`#F8FAFF`)**
- **Sculpted Soft Geometry**: เอกลักษณ์รูปทรงเรขาคณิตโค้งมน นุ่มนวล ด้วยการ์ดความโค้งมนระดับ 32px (`rounded-[32px]`) และส่วนโต้ตอบความโค้งมนระดับ 12px (`rounded-xl`)
- **Quiet Depth (Elevation)**: ปฏิเสธเส้นขอบทึบและเงาสีดำกระด้าง ใช้เฉพาะเงาโปร่งแสงแบบฟุ้งกระจาย (Diffuse Ambient Shadow ความทึบแสงต่ำกว่า 5%) สร้างมิติราวกับลอยอยู่บนผืนผ้าใบ
- **High-Clarity Micro-Hierarchy**: จัดลำดับชั้นตัวอักษรอย่างประณีต ข้อมูลทะเบียนและรหัสประจำตัวประชาชน 13 หลักแสดงผลด้วย Tabular Monospace font พร้อมรหัสสีบอกสถานะที่ชัดเจน ป้องกันความล้าสายตาของเจ้าหน้าที่

---

## 2. โครงสร้างแผนผังเว็บไซต์ (Sitemap & Navigation Hierarchy)

```
VMS Web Application
├── (auth)/
│   ├── /login                     [1. Login — Centered 420px Soft Card]
│   └── /forgot-password
│
└── (dashboard)/                   [Main App Layout: 260px Left Nav + 64px Sticky Header]
    ├── /dashboard                 [2. Dashboard & Statistics]
    │
    ├── /populations               [3. Population List]
    │   ├── /new                   [4. Add Population Form]
    │   ├── /[id]                  [5. Population Detail View]
    │   └── /[id]/edit             [4. Edit Population Form]
    │
    ├── /houses                    [6. House List]
    │   ├── /new                   (Add House Dialog)
    │   └── /[id]                  [7. House Detail & Households]
    │       ├── /members           [8. Household Members Management]
    │       └── /transfer          [9. Household Transfer Wizard]
    │
    ├── /documents                 [10. Document Management & Repository]
    │
    ├── /users                     [11. User Management]
    ├── /roles                     [12. Role Management]
    ├── /permissions               [13. Permission Management Registry]
    │
    ├── /settings/village          [14. Village Settings]
    ├── /settings/profile          [15. Personal Settings & Security]
    └── /audit-logs                [16. Audit & Security Activity Logs]
```

---

## 3. ดีไซน์ซิสเต็มและโทเค็น (Design Tokens & Visual Language)

### 3.1 Color Palette (พาเลตต์สีระบบ)

#### สีหลัก (Primary Civic Identity):
- **Civic Cobalt (`#3B82F6`)**: สีเอกลักษณ์หลักของแบรนด์ ใช้สำหรับปุ่มกดหลัก (Primary CTA), Active Tab, Brand Icon, และ Active Input Ring
- **Deep Cobalt Hover (`#2563EB`)**: สีสถานะ Hover และ Active กดปุ่ม
- **Civic Tint / Subtle Blue (`#EFF6FF`)**: สีพื้นหลังของไอคอนคอนเทนเนอร์, Badge อ่อน, และแถวตารางที่ถูกเลือก

#### สีเน้นสถานะทางความหมาย (Semantic Accents — ห้ามใช้ตกแต่งตามอำเภอใจ):
- **Living Emerald (`#059669`)**: สถานะมีชีวิต, ตรวจสอบแล้ว, ข้อมูลสมบูรณ์
- **Warning Amber (`#D97706`)**: สถานะรอดำเนินการ, ผู้อยู่อาศัยชั่วคราว, รอการอนุมัติย้าย
- **Crimson Rose (`#E11D48`)**: สถานะถึงแก่กรรม, การระงับสิทธิ์, การเก็บถาวร (Archive), การลบข้อมูล

#### สีพื้นผิวและตัวอักษร (Neutral & Canvas):
- **Slate Ink (`#0F172A`)**: หัวเรื่องหลัก (Headings) ความคมชัดสูงสุด
- **Deep Slate Body (`#334155`)**: เนื้อความทั่วไป, ป้ายกำกับฟิลด์ (Labels)
- **Slate Muted (`#64748B`)**: คำอธิบายประกอบ, Metadata รอง, หัวตาราง
- **Slate Placeholder (`#94A3B8`)**: ข้อความ Placeholder ในช่องกรอก
- **Border Stroke (`#E2E8F0` / `#F1F5F9`)**: เส้นขอบบางเฉียบ (Hairline 1px)
- **Canvas Base (`#F8FAFF`)**: สีพื้นหลังหน้าจอ ช่วยลดความล้าของสายตา
- **Pure Surface (`#FFFFFF`)**: สีพื้นผิวของการ์ด, Dialog, Sheet

#### กฎเหล็กด้านสี (Color Invariants):
1. **The One Civic Voice Rule**: พื้นที่หน้าจออย่างน้อย 85% ต้องเป็นสี Neutral โทนสี Civic Cobalt (`#3B82F6`) สงวนไว้เฉพาะการกระทำหลักและจุดโฟกัสเท่านั้น เพื่อสร้างความสงบตา
2. **The Semantic Truth Rule**: ห้ามใช้ Emerald, Amber, หรือ Crimson เพื่อการตกแต่ง ใช้แสดงสถานะทางทะเบียนเท่านั้น

---

### 3.2 ระบบตัวอักษร (Typography Hierarchy)

- **Display & Body Font**: `Geist Sans` (`var(--font-font-sans)`, `system-ui, -apple-system, sans-serif`)
- **Tabular & Code Font**: `Geist Mono` (`var(--font-font-mono)`, `monospace`)
- **Thai Script Complement**: `Sarabun` / `IBM Plex Sans Thai`

| ระดับ (Level) | ขนาด / Line Height | น้ำหนัก / Tracking | การใช้งาน |
|:---|:---:|:---:|:---|
| **Display** | 24px (1.5rem) / 1.25 | Bold 700 / -0.025em | หัวเรื่อง Modal, หน้า Login Hero, Page Heading สำคัญ |
| **Headline** | 20px (1.25rem) / 1.35 | SemiBold 600 / -0.015em | หัวข้อย่อยประจำหน้า, ตัวเลขสถิติ Dashboard Card |
| **Title** | 16px (1rem) / 1.4 | SemiBold 600 / -0.01em | หัวข้อ Widget, ชื่อการ์ด, ป้ายกำกับกลุ่มฟอร์ม |
| **Body** | 14px (0.875rem) / 1.5 | Regular 400 / normal | ข้อมูลในตาราง, เนื้อหาแบบฟอร์ม, ย่อหน้าอธิบาย |
| **Label** | 12px (0.75rem) / 1.0 | SemiBold 600 / normal | ป้ายกำกับ Input (snug mb-1.5), Badge, หัวคอลัมน์ตาราง |

> [!IMPORTANT]
> **The Masked Integrity Rule**: เลขประจำตัวประชาชน 13 หลักต้องแสดงผลด้วย Tabular Monospace font (`Geist Mono`) และคั่นด้วยยัติภังค์เสมอ เช่น `1-XXXX-XXXXX-23-4` หรือ `1-1002-00123-45-6` เพื่อป้องกันการอ่านหลักตัวเลขคลาดเคลื่อน

---

### 3.3 รูปร่าง มิติ และระดับความลึก (Shapes & Elevation)

#### รูปร่าง (Geometry):
- **Cards & Shell Containers**: 32px radius (`rounded-[32px]`) สำหรับการ์ดลอยอิสระ, 24px (`rounded-3xl`) สำหรับพาเนลภายใน
- **Interactive Elements (Buttons & Inputs)**: 12px radius (`rounded-xl`)
- **Icon Containers**: 16px radius (`rounded-2xl`) พร้อมพื้นหลังโปร่งแสง `border-blue-100/70 bg-blue-50/80`
- **Toggles & Checkboxes**: 4px radius (`rounded`) ขนาด 16px x 16px (`h-4 w-4`)

#### มิติความลึก (Shadow Vocabulary):
- **Ambient Card Elevation**: `box-shadow: 0 20px 50px rgba(0, 0, 0, 0.04)` (นุ่มนวล ลอยเด่นโดยไม่ใช้ขอบดำ)
- **Soft Component Elevation**: `box-shadow: 0 20px 25px -5px rgba(226, 232, 240, 0.5)` สำหรับ Dashboard Widgets
- **Interactive Button Elevation**: `box-shadow: 0 1px 2px 0 rgba(59, 130, 246, 0.25)` สำหรับปุ่ม Primary
- **Focus Ring Glow**: `box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.10)` วงแหวนสีฟ้าอ่อนรอบ Input ขณะโฟกัส
- **The Diffuse Depth Rule**: ห้ามใช้เงาดำทึบเกิน 5% opacity ทุกชิ้นงานต้องลอยด้วยแสงธรรมชาติ

---

### 3.4 คอมโพเนนต์มาตรฐาน (Component Specifications)

#### 1. ปุ่มกด (Buttons):
- **ความสูงมาตรฐาน**: 44px (`h-11`) เพื่อความสะดวกในการสัมผัสและคลิก (Touch Accessibility)
- **Primary Button**: `bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-xl px-4 py-2.5 text-sm font-medium shadow-sm shadow-blue-500/25 active:scale-[0.99] transition-all`
- **Outline / Secondary**: `bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl px-4 py-2.5 text-sm font-medium`

#### 2. ช่องกรอกข้อมูล (Inputs & Fields):
- **ความสูงมาตรฐาน**: 44px (`h-11`), `rounded-xl`, `bg-white border border-slate-200 text-slate-900 text-sm placeholder:text-slate-400`
- **ไอคอนประกอบ**: Start icon ระยะซ้าย 14px พร้อม `pl-10`
- **Focus State**: `border-blue-500 ring-4 ring-blue-500/10 outline-none`

#### 3. การ์ดและกล่องข้อมูล (Cards):
- **Standalone Card**: `rounded-[32px] bg-white border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.04)] p-8 sm:p-10`
- **Interior Dashboard Widget**: `rounded-3xl bg-white border border-slate-100 shadow-sm p-6`

#### 4. บทบาทของ SweetAlert2 vs shadcn/ui Dialog:
- **shadcn/ui Dialog / Sheet**: ใช้สำหรับงานกรอกข้อมูลทั่วไป เช่น แบบฟอร์มเพิ่มบ้าน, หน้าต่างตัวกรองขั้นสูง, ลิ้นชักรายละเอียด (In-page Workflows)
- **SweetAlert2 (Custom Themed)**: ใช้เฉพาะ **การกระทำที่มีความเสี่ยงสูง (High-consequence Confirmations)** เช่น:
  - ยืนยันการย้ายบุคคลออกจากครัวเรือน
  - ยืนยันการเก็บถาวร (Archive) ข้อมูลประชากร
  - ยืนยันการขอเปิดดูเลขประจำตัวประชาชนตัวเต็ม (พร้อมช่องระบุเหตุผล)
  - แจ้งเตือนข้อผิดพลาดร้ายแรงจากเซิร์ฟเวอร์

---

## 4. ข้อกำหนดหน้าจอหลักทั้ง 16 หน้า (Page Specifications)

### 1. หน้าเข้าสู่ระบบ (Login)
- **Layout**: Center-staged Single-Card Presentation จำกัดความกว้าง `max-w-[420px]` ลอยเด่นบนผืนผ้าใบ `bg-[#F8FAFF]`
- **Card**: ความโค้งมน `rounded-[32px]` พร้อมเงา `shadow-[0_20px_50px_rgba(0,0,0,0.04)]`
- **Header**: ตราสัญลักษณ์หมู่บ้านในไอคอนคอนเทนเนอร์มน 16px (`rounded-2xl border-blue-100 bg-blue-50/80 p-3`), หัวเรื่อง Display 24px "ลงชื่อเข้าใช้ระบบ VMS"
- **Form Controls**: Email input (`h-11`, start icon mail), Password input (`h-11`, eye toggle icon), Custom 16px Checkbox "จดจำการเข้าสู่ระบบ", ปุ่ม Primary CTA "เข้าสู่ระบบ" (`h-11`, Civic Cobalt)
- **Security Feedback**: แสดงการนับถอยหลังล็อกเอาท์เมื่อใส่รหัสผ่านผิดเกิน 5 ครั้ง

### 2. หน้าแดชบอร์ดภาพรวม (Dashboard)
- **Layout**: Header แสดงชื่อหมู่บ้านปัจจุบันและตัวสลับหมู่บ้าน (Tenant Switcher) สำหรับผู้ดูแล
- **Top Metrics Grid (4 คอลัมน์)**:
  - ประชากรทั้งหมดในพื้นที่ (Total Population)
  - ประชากรตามทะเบียนราษฎร์ (Official ท.ร.14) — Badge Living Emerald
  - ประชากรแฝง / ผู้อยู่อาศัยจริง (Actual Residents / Tenants) — Badge Warning Amber
  - จำนวนครัวเรือนและบ้านทั้งหมด (Households & Houses)
- **Charts Section**:
  - Demographic Age Pyramid (จัดกลุ่ม 0-14, 15-59, 60+ แยกชาย/หญิง)
  - แผนภูมิวงกลมสัดส่วนการอยู่อาศัย (Official vs Actual Resident)
- **Recent Activities Table**: 5 รายการการย้ายและการขึ้นทะเบียนล่าสุด พร้อมลิงก์เข้าดู

### 3. หน้ารายการประชากร (Population List)
- **Control Bar**:
  - Search Input ค้นหาแบบเรียลไทม์ (ชื่อ, นามสกุล, หรือเลขบัตร 13 หลัก)
  - Filter Pills: เพศ, สถานะการมีชีวิต, ประเภทการอยู่อาศัย, ช่วงอายุ
  - Action Button: ปุ่ม "เพิ่มประชากรใหม่" (Civic Cobalt `h-11`)
- **Data Table Layout**: ความสูงแถว 48px, Zebra hover subtle (`hover:bg-slate-50/80`)
  - คอลัมน์: รหัสประชากร (P-YYYY-XXXXX), ชื่อ-สกุล, เลขประจำตัวประชาชน (Geist Mono tabular masked), เพศ, อายุ, บ้านเลขที่, สถานะการอยู่อาศัย (Badge), ปุ่มจัดการ

### 4. หน้าเพิ่ม/แก้ไขประชากร (Add / Edit Population)
- **Container**: Card `rounded-[32px]` แบบ 2-Column Responsive
- **Section 1 (ข้อมูลส่วนบุคคล)**: คำนำหน้า, ชื่อ, นามสกุล, เลขบัตร 13 หลัก (ตรวจสอบ Check Digit Mod 11 ทันทีที่พิมพ์ครบ), วันเดือนปีเกิด, เพศ, สัญชาติ, ศาสนา
- **Section 2 (ข้อมูลติดต่อและการศึกษา)**: เบอร์โทรศัพท์, อาชีพ, ระดับการศึกษาสูงสุด
- **Bottom Actions**: ปุ่มยกเลิก และปุ่มบันทึกข้อมูล (Civic Cobalt `h-11`)

### 5. หน้ารายละเอียดประชากร (Population Detail)
- **Profile Header**: ข้อมูลสังเขป, Badge สถานะ (มีชีวิต / ถึงแก่กรรม, ในพื้นที่ / นอกพื้นที่)
- **Sensitive Field Shield**: เลขบัตรประชาชนแสดงในรูปแบบ `1-XXXX-XXXXX-XX-X` พร้อมปุ่มรูปดวงตา "เปิดดูเลขเต็ม" (เรียก SweetAlert2 ยืนยันเหตุผล -> ตรวจสอบสิทธิ์ `person.sensitive.read` -> Decrypt AES-256 แสดงผล พร้อมบันทึก Audit Log)
- **Tabs Panel (`rounded-3xl`)**:
  - แท็บ 1: ประวัติการอยู่อาศัยในครัวเรือน (อดีตและปัจจุบัน)
  - แท็บ 2: คลังเอกสารแนบส่วนบุคคล
  - แท็บ 3: ประวัติการแก้ไขข้อมูล (Field-level Audit History)

### 6. หน้ารายการบ้าน (House List)
- **View Modes**: สลับได้ระหว่าง Table View และ Visual Card Grid View
- **Card Elements**: รูปถ่ายบ้าน (ถ้ามี), เลขที่บ้านเด่นชัด, หมู่ที่, จำนวนครัวเรือนภายในบ้าน, จำนวนผู้อยู่อาศัยรวม, พิกัด GPS (ปุ่มเปิด Google Maps)

### 7. หน้ารายละเอียดบ้าน (House Detail)
- **Structure**: ข้อมูลสิ่งปลูกสร้าง, พิกัด GPS, เอกสารกรรมสิทธิ์/ทะเบียนบ้าน
- **Household Accordion**: แสดงรายชื่อครัวเรือนที่ตั้งอยู่ในบ้านหลังนี้ (รองรับกรณีบ้านเช่าหลายครัวเรือน)

### 8. หน้าจัดการสมาชิกครัวเรือน (Household Members Management)
- **Header**: รหัสครัวเรือน (HH-YYYY-XXXX), หัวหน้าครัวเรือนปัจจุบัน
- **Member Rows**:
  - Badge สีน้ำเงิน: ตามทะเบียนราษฎร์ (Official ท.ร.14)
  - Badge สีเขียว: ผู้อยู่อาศัยจริง / ผู้เช่า (Actual Resident)
  - Badge สีเทา: มีชื่อแต่ไม่อยู่จริง (Official Absent)
- **Controls**: ปุ่มแต่งตั้งเป็นหัวหน้าครัวเรือน, ปุ่มย้ายออกจากครัวเรือน

### 9. หน้าดำเนินการย้ายบุคคล (Household Transfer Wizard)
- **Stepper Header**: 3 ขั้นตอนชัดเจน (1. เลือกบุคคล -> 2. เลือกบ้านปลายทาง -> 3. กำหนดความสัมพันธ์และยืนยัน)
- **Validation**: ตรวจสอบหัวหน้าครัวเรือนปลายทาง และบังคับแต่งตั้งหัวหน้าใหม่หากย้ายหัวหน้าเก่าออก
- **Confirmation**: แสดงกล่องสรุปผลก่อน Commit Transaction

### 10. หน้าระบบคลังเอกสาร (Document Management)
- **Categories**: ทะเบียนบ้าน, สำเนาบัตรประชาชน, หนังสือยินยอม, เอกสารราชการหมู่บ้าน
- **Viewer**: แสดงพรีวิวไฟล์ PDF/รูปภาพผ่าน Temporary Signed URL (อายุ 60 วินาที)

### 11. หน้าจัดการผู้ใช้งาน (User Management)
- **Data Table**: รายชื่อเจ้าหน้าที่, อีเมล, สิทธิ์บทบาท, หมู่บ้านที่ดูแล, สถานะการใช้งาน
- **Actions**: ปุ่มเปิด/ปิดการใช้งานบัญชี, ปุ่มรีเซ็ตรหัสผ่าน

### 12. หน้าจัดการบทบาท (Role Management)
- **Role Cards (`rounded-3xl`)**: แสดงชื่อบทบาท, จำนวนผู้ใช้ในบทบาท, ป้ายสิทธิ์ที่ได้รับ

### 13. หน้าจัดการสิทธิ์ (Permission Registry Management)
- **Grouped Table**: แยกตามหมวดหมู่ (Population, Household, Document, User, Settings, Audit) แสดงรหัสสิทธิ์และคำอธิบายภาษาไทย

### 14. หน้าตั้งค่าหมู่บ้าน (Village Settings)
- **Profile Form**: ชื่อหมู่บ้าน, หมู่ที่, ตำบล, อำเภอ, จังหวัด, รหัสไปรษณีย์, เบอร์ติดต่อ, อัปโหลดตราสัญลักษณ์ประจำหมู่บ้าน

### 15. หน้าตั้งค่าส่วนบุคคล (Personal Settings & Security)
- **Tabs**: แก้ไขชื่อแสดงผล, เปลี่ยนรหัสผ่าน, ตั้งค่าการยืนยันตัวตนสองชั้น (MFA TOTP QR Code)

### 16. หน้าบันทึกประวัติการดำเนินงาน (Audit Log Viewer)
- **Filter Bar**: เลือกช่วงวันที่, ผู้ใช้งาน, โมดูล, ประเภทการกระทำ (CREATE, UPDATE, SENSITIVE_VIEW, EXPORT)
- **Event Drawer**: ลิ้นชักเลื่อนจากด้านขวาแสดง JSON Diff (Safe Delta) ค่าก่อนหน้าและค่าใหม่ที่ถูกเปลี่ยนแปลง
