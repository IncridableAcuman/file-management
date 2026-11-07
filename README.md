# ☁️ FileVault — Modern Cloud File Management System

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4+-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4-38bdf8.svg)](https://tailwindcss.com/)
[![Shadcn UI](https://img.shields.io/badge/shadcn%2Fui-Base%20UI-black.svg)](https://ui.shadcn.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ed.svg)](https://www.docker.com/)

**FileVault** — bu **Dropbox** va **Google Drive** uslubida yaratilgan zamonaviy, xavfsiz va yuqori unumdorlikka ega bulutli fayllar boshqaruvi tizimi. Loyiha eng so'nggi **shadcn/ui** komponentlari, **Tailwind CSS v4** va **Spring Boot** mikroservis arxitekturasi asosida qurilgan.

---

## 🚀 Asosiy Imkoniyatlar

### 📁 1. File Explorer & Xotira Boshqaruvi
- **Vizual Storage Overview**: 100 GB umumiy xotirani toifalar (Hujjatlar, Rasmlar, Videolar, Audio, Arxivlar, Dasturiy kod) bo'yicha rangli tahlil qilish va segmentli progress bar.
- **Ko'rinish rejimlari**:
  - **Grid View**: Thumbnail preview, format nishonlari va metadata kartalari.
  - **List View**: Katta hajmdagi fayllarni boshqarish uchun qulay jadval.
- **Kataloglar tuzilmasi (Folders & Breadcrumbs)**: Ichma-ich papkalar yaratish, rangli teglash va qulay yo'l navigatsiyasi.
- **Drag & Drop Upload**: Fayllarni sudrab tashlab yuklash, progress bar va maqsadli papkani tanlash.
- **Saralash & Filtrlash**: Nomi, hajmi, oxirgi o'zgartirilgan sanasi va turi bo'yicha saralash, jonli qidiruv (Live Search).
- **Multi-select**: Bir vaqtning o'zida bir nechta faylni tanlash, guruhlab yuklab olish yoki savatga tashlash.
- **Fayl amallari**: Ko'rish (Preview modal), Ulashish (Share dialog — email taklifi va ommaviy havola), Nomini o'zgartirish (Rename), Yulduzcha (Starred/Favorites).
- **Chiqindilar qutisi (Recycle Bin)**: Savatga tashlangan fayllarni tiklash yoki butunlay tozalash.

### 🔐 2. Xavfsizlik & Autentifikatsiya
- **Faqat avtorizatsiyadan o'tgan foydalanuvchilar**: Tizimga kirmagan shaxslar asosiy sahifa va fayllarga kira olmaydi.
- **Kirish (Login)**: JWT Access & Refresh tokenlar asosida himoyalangan sessiya.
- **Ro'yxatdan o'tish (Register) & 6-xonali OTP**: Emailga bir martalik tasdiqlash kodi jo'natish, 60 soniyalik qayta jo'natish taymeri (Cooldown) va Redis orqali tekshirish.
- **Parolni unutdim (Forgot Password)**: Emailga xavfsiz parolni tiklash havolasini yuborish.
- **Parolni yangilash (Reset Password)**: Havola orqali avtomatik ochiluvchi yangi parol o'rnatish oynasi.
- **Chiqish (Logout)**: Tasodifiy chiqib ketishni oldini oluvchi tasdiqlash dialogi va silliq loading animatsiyasi.

### 🎨 3. UI/UX & Dizayn
- **Dark & Light Mode**: Tizim yoki foydalanuvchi tanlovi asosida yorug' va qorong'u rejimlarga bir zumda o'tish.
- **Formatga mos ranglar**: PDF qizil, Word/Docs ko'k, Excel yashil, Video binafsha, Rasm sariq, Kod neon-cyan, ZIP to'q sariq.
- **To'liq responsiv**: Mobil qurilmalar, planshetlar va keng ekranli monitorlar uchun moslashgan.

### 👑 4. Admin Boshqaruvi & Tizim Statistikasi
- **Admin Dashboard**: Faqat `ROLE_ADMIN` huquqiga ega bo'lgan foydalanuvchilar uchun maxsus boshqaruv paneli.
- **To'liq Tahlil & Metrikalar**:
  - Jami foydalanuvchilar (faol, bloklangan, adminlar va oddiy foydalanuvchilar soni).
  - Jami fayllar, savatdagi fayllar, papkalar soni va xotira sarfi.
  - Toifalar bo'yicha sarflangan xotira va fayllar miqdori tahlili (Documents, Images, Videos, Audio, Archives, Code).
  - **Top Storage Users**: Xotiradan eng ko'p foydalanayotgan yetakchi foydalanuvchilar reytingi.
- **Foydalanuvchilarni boshqarish**:
  - Jonli qidiruv va filtrlash (rol va holat bo'yicha).
  - Foydalanuvchini bloklash / qayta faollashtirish (`Block / Unblock`).
  - Rolni o'zgartirish (`Admin / User`).
  - Foydalanuvchini tizimdan barcha ma'lumotlari bilan to'liq o'chirish.

### 🔔 5. Bildirishnomalar Tizimi (Notification System)
- **Admin tomondan yuborish**:
  - **Broadcast**: Barcha tizim foydalanuvchilariga umumiy e'lon jo'natish.
  - **Direct**: Ma'lum bir foydalanuvchini tanlab individual xabar jo'natish.
  - Xabar turlari: `INFO` (ma'lumot), `SUCCESS` (muvaffaqiyat), `WARNING` (ogohlantirish), `ALERT` (shoshilinch).
- **Foydalanuvchi qismi**:
  - Navbar da jonli bildirishnomalar qo'ng'irog'i (Bell) va o'qilmaganlar soni nishoni (Badge).
  - O'qilgan deb belgilash (`Mark as read`) va barchasini o'qilgan qilish (`Mark all as read`).
  - Har bir xabar turiga mos vizual ikonkalar va ranglar.

---

## 🛠 Texnologiyalar Steki

| Qism | Texnologiyalar |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Base UI (shadcn/ui), Lucide Icons, Axios |
| **Backend** | Java 21, Spring Boot 3.4+, Spring Security, Spring Data JPA, Hibernate, Thymeleaf |
| **Ma'lumotlar bazasi** | PostgreSQL 16 |
| **Kesh & Xabarlar** | Redis 7, RabbitMQ 3 |
| **Web Server & Konteyner** | Nginx (Alpine), Docker, Docker Compose |

---

## 📂 Loyiha Tuzilmasi

```text
file-management/
├── backend/                        # Spring Boot ilovasi
│   ├── src/main/java/              # Java kontrollerlar, servislar, entitylar
│   ├── src/main/resources/
│   │   ├── templates/              # Email HTML shablonlari (forgot-password, otp-template)
│   │   └── application.yaml        # Konfiguratsiya fayli
│   ├── Dockerfile                  # Backend multi-stage Docker fayli
│   └── .dockerignore
├── frontend/                       # React + Vite ilovasi
│   ├── src/
│   │   ├── components/             # UI, layout, files, auth komponentlari
│   │   ├── context/                # AuthContext, ThemeContext
│   │   ├── pages/                  # Dashboard, MyFiles, Shared, Starred, Recent, Trash, Auth
│   │   └── services/               # API mijozi, authService, fileService
│   ├── nginx.conf                  # Production SPA Nginx konfiguratsiyasi
│   ├── Dockerfile                  # Frontend multi-stage Docker fayli
│   └── .dockerignore
├── docker-compose.yaml             # To'liq stackni ishga tushiruvchi docker-compose
└── README.md                       # Loyiha qo'llanmasi
```

---

## 🐳 Docker Orqali Ishga Tushirish (Tavsiya etiladi)

Loyiha to'liq Docker muhitiga tayyorlangan. Barcha xizmatlarni (PostgreSQL, Redis, RabbitMQ, Backend, Frontend) 1 ta buyruq bilan ishga tushirish mumkin:

```bash
# 1. Loyiha katalogiga kiring
cd file-management

# 2. Docker containerlarini yig'ing va ishga tushiring
docker compose up --build -d
```

### Xizmatlar portlari:
- **Frontend Web UI**: [http://localhost:80](http://localhost:80) yoki [http://localhost:5173](http://localhost:5173)
- **Backend REST API**: [http://localhost:8080/api/v1](http://localhost:8080/api/v1)
- **Swagger API Docs**: [http://localhost:8080/api/v1/swagger-ui.html](http://localhost:8080/api/v1/swagger-ui.html)
- **RabbitMQ Dashboard**: [http://localhost:15672](http://localhost:15672) (guest / guest)
- **PostgreSQL**: `localhost:5432` (`filemanagement` / `admin2003` / `admin2003`)
- **Redis**: `localhost:6379`

To'xtatish uchun:
```bash
docker compose down
```

---

## 💻 Mahalliy Muhitda Ishga Tushirish (Development)

### Talablar:
- Java 21+ JDK
- Node.js 20+ va npm
- PostgreSQL (port: 5432)
- Redis (port: 6379)

### 1. Backend:
```bash
cd backend

# Loyihani kompilyatsiya qilish va ishga tushirish
./gradlew bootRun
```
*Backend `http://localhost:8080/api/v1` manzilida ishga tushadi.*

### 2. Frontend:
```bash
cd frontend

# Kutubxonalarni o'rnatish
npm install

# Ishlab chiquvchi serverini yoqish
npm run dev
```
*Frontend `http://localhost:5173` manzilida ochiladi.*

---

## 📡 API Endpointlari

### Autentifikatsiya (`/api/v1/auth`):
| Metod | Endpoint | Tavsif |
| :--- | :--- | :--- |
| `POST` | `/auth/register` | Yangi foydalanuvchi ro'yxatdan o'tishi (OTP emailga jo'natiladi) |
| `POST` | `/auth/verify-email` | 6-xonali OTP kod orqali emailni tasdiqlash va faollashtirish |
| `POST` | `/auth/resend-otp` | Yangi OTP kodini emailga qayta jo'natish |
| `POST` | `/auth/login` | Tizimga kirish (AccessToken & RefreshToken) |
| `POST` | `/auth/forgot-password` | Parolni tiklash havolasini emailga jo'natish |
| `POST` | `/auth/reset-password` | Havola tokeni orqali yangi parol o'rnatish |
| `POST` | `/auth/refresh` | Access tokenni yangilash |
| `POST` | `/auth/logout` | Tizimdan chiqish |

### Foydalanuvchilar (`/api/v1/users`):
| Metod | Endpoint | Tavsif |
| :--- | :--- | :--- |
| `GET` | `/users` | Barcha foydalanuvchilar ro'yxati (ADMIN) |
| `GET` | `/users/{id}` | Foydalanuvchi profil ma'lumotlari |
| `POST` | `/users/{id}` | Foydalanuvchi parolini yangilash |

### Fayllar (`/api/v1/files`):
| Metod | Endpoint | Tavsif |
| :--- | :--- | :--- |
| `GET` | `/files` | Fayllar ro'yxati (filtrlar: `category`, `folderId`, `trashed`, `favorite`, `search`) |
| `GET` | `/files/shared` | Foydalanuvchi bilan ulashilgan fayllar |
| `GET` | `/files/storage-stats` | Umumiy va toifalar bo'yicha xotira sarfi tahlili |
| `GET` | `/files/{id}` | Fayl metadatasini olish |
| `POST` | `/files/upload` | Multipart fayl yuklash (`files` / `file`, ixtiyoriy `folderId`) |
| `GET` | `/files/{id}/download` | Faylni to'g'ridan-to'g'ri yuklab olish (streaming) |
| `GET` | `/files/{id}/preview` | Faylni brauzerda ko'rish (inline streaming) |
| `PATCH` | `/files/{id}/rename` | Fayl nomini o'zgartirish |
| `PATCH` | `/files/{id}/favorite` | Yulduzcha qo'yish / olib tashlash |
| `PATCH` | `/files/{id}/trash` | Chiqindilar qutisiga tashlash |
| `PATCH` | `/files/{id}/restore` | Savatdan qayta tiklash |
| `DELETE` | `/files/{id}` | Faylni butunlay o'chirish (diskdan ham) |
| `DELETE` | `/files/trash/empty` | Savatni butunlay tozalash |
| `POST` | `/files/{id}/share` | Faylni boshqa foydalanuvchiga ulashish (`email`, `role`) |

### Kataloglar (`/api/v1/folders`):
| Metod | Endpoint | Tavsif |
| :--- | :--- | :--- |
| `GET` | `/folders` | Kataloglar ro'yxati (filtrlar: `trashed`, `favorite`) |
| `GET` | `/folders/{id}` | Katalog ma'lumotlari (fayllar soni va umumiy hajmi bilan) |
| `POST` | `/folders` | Yangi katalog yaratish (`name`, `parentId`, `color`) |
| `PATCH` | `/folders/{id}/rename` | Katalog nomini o'zgartirish |
| `PATCH` | `/folders/{id}/favorite` | Katalogga yulduzcha qo'yish / olib tashlash |
| `PATCH` | `/folders/{id}/trash` | Katalogni savatga tashlash (ichidagi fayllari bilan) |
| `PATCH` | `/folders/{id}/restore` | Katalogni savatdan tiklash |
| `DELETE` | `/folders/{id}` | Katalogni butunlay o'chirish |

### 👑 Admin Boshqaruvi (`/api/v1/admin`):
| Metod | Endpoint | Tavsif |
| :--- | :--- | :--- |
| `GET` | `/admin/stats` | Tizim statistikasi (Users, Files, Folders, Categories tahlili, Top storage consumers) |
| `GET` | `/admin/users` | Barcha foydalanuvchilar batafsil ma'lumotlari va statistikasi bilan |
| `PATCH` | `/admin/users/{id}/status` | Foydalanuvchini bloklash yoki faollashtirish (`enabled=true/false`) |
| `PATCH` | `/admin/users/{id}/role` | Foydalanuvchi rolini o'zgartirish (`role=ADMIN/USER`) |
| `DELETE` | `/admin/users/{id}` | Foydalanuvchini barcha fayllari va ma'lumotlari bilan o'chirish |
| `POST` | `/admin/notifications` | Foydalanuvchilarga bildirishnoma yuborish (Broadcast yoki Direct) |
| `GET` | `/admin/notifications` | Yuborilgan bildirishnomalar tarixi |

### 🔔 Bildirishnomalar (`/api/v1/notifications`):
| Metod | Endpoint | Tavsif |
| :--- | :--- | :--- |
| `GET` | `/notifications` | Foydalanuvchiga kelgan bildirishnomalar |
| `GET` | `/notifications/unread-count` | O'qilmagan bildirishnomalar soni |
| `PATCH` | `/notifications/{id}/read` | Bildirishnomani o'qildi deb belgilash |
| `PATCH` | `/notifications/read-all` | Barcha bildirishnomalarni o'qildi deb belgilash |
| `DELETE` | `/notifications/{id}` | Bildirishnomani o'chirish |

---

## 📄 Litsenziya
Ushbu loyiha ochiq kodli bo'lib, ta'lim va tijoriy maqsadlarda foydalanish uchun ochiq.
