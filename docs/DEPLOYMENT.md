# สถาปัตยกรรมการติดตั้งและการปฏิบัติการระบบ (Deployment & Operations Specification)
## Smart Village Management System (VMS) — Self-Hosted on Ubuntu VPS via Docker

---

## 1. ภาพรวมสถาปัตยกรรมโครงสร้างพื้นฐาน (Infrastructure Topology)

ระบบ VMS ถูกออกแบบให้ติดตั้งแบบ **Self-Hosted บน Ubuntu VPS (เริ่มต้นที่ 2 vCPU, RAM 4GB, SSD 50GB)** ด้วย **Docker Compose** โดยมี **Reverse Proxy (Nginx หรือ Caddy)** ทำหน้าที่จัดสรรเส้นทางและดูแลความปลอดภัยของ SSL/TLS:

```
[Internet Users] 
      │ HTTPS (Port 443)
      ▼
[Reverse Proxy: Nginx / Caddy] (SSL Termination, Rate Limiting, Security Headers)
      ├── /api/auth/*     ──> [Supabase GoTrue (Port 9999)]
      ├── /storage/v1/*   ──> [Supabase Storage Engine (Port 5000)]
      └── /*              ──> [Next.js 16 Application (Port 3000)]
                                   │
                                   ├── Prisma ORM Connection
                                   ▼
                      [PostgreSQL 15+ (Internal Docker Network)]
                                   ▲
                                   │ Nightly Automated Backup
                      [Backup Runner (GPG Encrypted + Offsite)]
```

---

## 2. โครงสร้างและคอนฟิก Docker Compose (`docker/docker-compose.yml`)

```yaml
version: '3.8'

services:
  # 1. Reverse Proxy & SSL Termination
  reverse-proxy:
    image: caddy:2-alpine
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy_data:/data
      - caddy_config:/config
    depends_on:
      - nextjs-app
      - supabase-auth
      - supabase-storage

  # 2. Next.js 16 Web Application
  nextjs-app:
    build:
      context: ..
      dockerfile: docker/Dockerfile.app
    restart: always
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}?schema=public
      - SUPABASE_AUTH_URL=http://supabase-auth:9999
      - SUPABASE_STORAGE_URL=http://supabase-storage:5000
      - FIELD_ENCRYPTION_KEY=${FIELD_ENCRYPTION_KEY}
      - BLIND_INDEX_PEPPER=${BLIND_INDEX_PEPPER}
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - internal-net

  # 3. PostgreSQL 15 Database
  postgres:
    image: postgres:15-alpine
    restart: always
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - internal-net

  # 4. Supabase GoTrue Auth Engine
  supabase-auth:
    image: supabase/gotrue:v2.158.0
    restart: always
    environment:
      GOTRUE_API_HOST: 0.0.0.0
      GOTRUE_API_PORT: 9999
      GOTRUE_DB_DRIVER: postgres
      DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}?sslmode=disable
      GOTRUE_SITE_URL: ${APP_SITE_URL}
      GOTRUE_JWT_SECRET: ${JWT_SECRET}
      GOTRUE_JWT_EXP: 3600
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - internal-net

  # 5. Supabase Storage Engine
  supabase-storage:
    image: supabase/storage-api:v1.11.0
    restart: always
    environment:
      ANON_KEY: ${STORAGE_ANON_KEY}
      SERVICE_KEY: ${STORAGE_SERVICE_KEY}
      POSTGREST_URL: http://postgres:5432
      PGRST_JWT_SECRET: ${JWT_SECRET}
      DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}
      FILE_SIZE_LIMIT: 52428800 # 50MB
      STORAGE_BACKEND: file
      FILE_STORAGE_BACKEND_PATH: /var/lib/storage
    volumes:
      - storage_data:/var/lib/storage
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - internal-net

volumes:
  postgres_data:
  storage_data:
  caddy_data:
  caddy_config:

networks:
  internal-net:
    driver: bridge
```

---

## 3. การจัดการตัวแปรสภาพแวดล้อม (Environment Variables Security)

ไฟล์ `.env.production` ต้องถูกจัดเก็บไว้เฉพาะบนเซิร์ฟเวอร์ VPS เท่านั้น และกำหนด Permission อย่างเข้มงวด:
```bash
chmod 600 /opt/vms/.env.production
chown root:root /opt/vms/.env.production
```

### ตัวแปรสำคัญที่ห้ามรั่วไหล:
- `FIELD_ENCRYPTION_KEY`: 32-byte Hex String สำหรับ AES-256-GCM
- `BLIND_INDEX_PEPPER`: 32-byte Random Secret สำหรับ HMAC Blind Index
- `JWT_SECRET`: คีย์สำหรับ Supabase Auth & Signed URLs
- `POSTGRES_PASSWORD`: รหัสผ่านฐานข้อมูลที่มีความยาวไม่ต่ำกว่า 24 ตัวอักษร สุ่มด้วยอัลกอริทึมปลอดภัย

---

## 4. แผนการสำรองและกู้คืนข้อมูล (Backup & Disaster Recovery Plan)

### 4.1 ระบบสำรองข้อมูลอัตโนมัติ (Automated Daily Backup Script)
สร้างสคริปต์สำรองข้อมูลรันผ่าน Linux Cron ทุกวันเวลา 02:00 น.:
```bash
#!/usr/bin/env bash
set -eo pipefail

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/vms"
DUMP_FILE="${BACKUP_DIR}/vms_db_${DATE}.sql.gz"
ENC_FILE="${DUMP_FILE}.gpg"

mkdir -p "$BACKUP_DIR"

# 1. ทำ pg_dump ฐานข้อมูล
docker exec -t $(docker ps -qf "name=postgres") pg_dump -U vms_admin vms_db | gzip > "$DUMP_FILE"

# 2. เข้ารหัสไฟล์สำรองข้อมูลด้วย GPG (Symmetric AES-256)
gpg --batch --yes --passphrase-file /opt/vms/backup_secret.key -c "$DUMP_FILE"
rm "$DUMP_FILE"

# 3. ซิงค์ไฟล์เข้ารหัสออกไปยัง Offsite Backup Storage (เช่น S3 หรือ Backup VPS)
rclone copy "$ENC_FILE" remote-backup:vms-backups/

# 4. ลบไฟล์สำรองข้อมูลเก่าเกิน 30 วัน
find "$BACKUP_DIR" -type f -name "*.gpg" -mtime +30 -delete
```

### 4.2 การซ้อมกู้คืนข้อมูล (Restore Testing Drills)
- ต้องมีการซ้อมกู้คืนข้อมูล (Disaster Recovery Simulation) ทุกไตรมาส บน Staging VPS
- ทดสอบคำสั่ง:
  ```bash
  gpg --batch --passphrase-file /opt/vms/backup_secret.key -d vms_db_YYYYMMDD.sql.gz.gpg | gunzip | docker exec -i postgres_container psql -U vms_admin -d vms_db
  ```
- ยืนยันว่าข้อมูลประชากร และการค้นหาผ่าน Blind Index ทำงานได้ตามปกติ 100%

---

## 5. การตรวจสอบสถานะและทรัพยากรระบบ (System Monitoring)

1. **Host-level Monitoring**:
   - ตรวจสอบอัตราการใช้ CPU, Memory, Disk Space
   - ตั้ง Alert ผ่าน Telegram / LINE Notify หาก RAM ถูกใช้งานเกิน 85% หรือพื้นที่ดิสก์เหลือต่ำกว่า 15%
2. **Application Health Check**:
   - เพิ่ม Endpoint `GET /api/health` ตรวจสอบความพร้อมของ Next.js, Prisma Database Connection และ Supabase Services
   - ใช้ Uptime Kuma หรือ StatusCake ยิงตรวจสอบทุก 60 วินาที
