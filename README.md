# 📚 Mizan - Modern İslami Yaşam Rehberi

<div align="center">

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-brightgreen)](https://nodejs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11.1-red)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED)](https://www.docker.com/)

**Kur'an, Hadis, Siyer ve Namaz Vakitleri İçin Kapsamlı Backend Servisi**

[Hızlı Başlangıç](#-hızlı-başlangıç) • [Özellikler](#-özellikler) • [API Docs](#-api-dokumentasyon) • [Kurulum](#-kurulum) • [Katkıda Bulunun](#-katkıda-bulunun)

</div>

---

## 📱 Uygulama Ekran Görüntüleri

<div align="center">
  <table>
    <tr>
      <td align="center">
        <img src="./image/anasayfa.jpeg" width="200" alt="Anasayfa"/>
        <br/><strong>Anasayfa</strong>
      </td>
      <td align="center">
        <img src="./image/kuran-mushaf.jpeg" width="200" alt="Kur'an Mushaf"/>
        <br/><strong>Kur'an Mushaf</strong>
      </td>
      <td align="center">
        <img src="./image/meal.jpeg" width="200" alt="Meal (Tefsir)"/>
        <br/><strong>Meal & Tefsir</strong>
      </td>
      <td align="center">
        <img src="./image/hadisler.jpeg" width="200" alt="Hadisler"/>
        <br/><strong>Hadis Koleksiyonu</strong>
      </td>
    </tr>
    <tr>
      <td align="center">
        <img src="./image/siyer.jpeg" width="200" alt="Siyer"/>
        <br/><strong>Siyer (Hz. Muhammed)</strong>
      </td>
      <td align="center">
        <img src="./image/kıble.jpeg" width="200" alt="Kıble Pusulası"/>
        <br/><strong>Kıble Pusulası</strong>
      </td>
      <td align="center">
        <img src="./image/kütüphane.jpeg" width="200" alt="Kütüphane"/>
        <br/><strong>Kütüphane</strong>
      </td>
      <td align="center">
        <img src="./image/kütühane-arama.jpeg" width="200" alt="Arama"/>
        <br/><strong>Gelişmiş Arama</strong>
      </td>
    </tr>
  </table>
</div>

---

## 🎯 Özellikler

- ✅ **Tam Kur'an Desteği** - Uthmani Mushaf, Multiple Tefsir/Meal
- ✅ **Kapsamlı Hadis Kütüphanesi** - Sahih Bukhari, Sahih Muslim (Türkçe)
- ✅ **Siyer-i Nebi** - Hz. Muhammed'in (s.a.v.) hayatı
- ✅ **Namaz Vakit Hesaplaması** - Coğrafi konum tabanlı, multiple hesaplama metodu
- ✅ **Kıble Pusulası** - Gerçek zamanlı GPS konum hesaplaması
- ✅ **Gelişmiş Arama** - PostgreSQL Full-Text Search + Hunspell Solver
- ✅ **Hızlı Senkronizasyon** - Redis tabanlı async işleme
- ✅ **Push Notifications** - Firebase Cloud Messaging (FCM) entegrasyonu
- ✅ **Offline-First** - Tüm veriler indirilip cihazda saklanabiliyor
- ✅ **API Dokumentasyon** - Swagger/OpenAPI

---

## 🏗️ Mimarı

Proje **Clean Architecture** prensipleri ile 4 katmanda organize edilmiştir:

```
src/
├── domain/           # İş kuralları (Entity'ler, İşletme Mantığı)
├── application/      # Use Case'ler, Port'lar (Soyutlamalar)
├── infrastructure/   # Teknik Detaylar (DB, Cache, API)
└── presentation/     # HTTP Controller'lar, DTO'lar
```

**Teknik Stack:**

- **Runtime:** Node.js 18+
- **Framework:** NestJS 11 (TypeScript)
- **Database:** PostgreSQL 16 + Sequelize ORM
- **Cache:** Redis 7 (BullMQ Worker Queue)
- **Full-Text Search:** PostgreSQL tsvector + GIN Index + Hunspell
- **Notifications:** Firebase Cloud Messaging (FCM)
- **Containerization:** Docker + Docker Compose

---

## 🚀 Hızlı Başlangıç

```bash
# 1. Repository'i klonla
git clone https://github.com/yourusername/mizan-app.git
cd mizan-app

# 2. Bağımlılıkları yükle
npm install

# 3. Environment ayarla
cp .env.example .env

# 4. Docker servislerini başlat (PostgreSQL + Redis)
npm run infra:up

# 5. Verileri import et
npm run db:bulk-import

# 6. Sunucuyu başlat
npm run start:dev

# 7. API Docs'u aç
open http://localhost:3000/api/docs
```

---

## 📋 İçindekiler

- [Kurulum](#-kurulum)
- [Veri İmport](#-veri-import)
- [API Dokumentasyon](#-api-dokumentasyon)
- [React Native Frontend](#-react-native-frontend)
- [Geliştirme](#-geliştirme)
- [Performans & Testler](#-performans--yük-testleri)
- [Teknik Notlar](#-teknik-notlar)
- [Katkıda Bulunun](#-katkıda-bulunun)

## 🛠️ Kurulum

### Ön Koşullar

- **Node.js** 18.0+ ([indir](https://nodejs.org/))
- **Docker** & **Docker Compose** ([indir](https://www.docker.com/))
- **Git** ([indir](https://git-scm.com/))

### İlk Kurulum

#### Adım 1: Klonla ve Bağımlılıkları Yükle

```bash
git clone https://github.com/yourusername/mizan-app.git
cd mizan-app
npm install
```

#### Adım 2: Environment Ayarlarını Konfigüre Et

```bash
cp .env.example .env
```

`.env` dosyasını ihtiyacına göre düzenle:

```env
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=55432
DB_NAME=mizan_db
DB_USER=mizan_user
DB_PASSWORD=your_secure_password
DB_SCHEMA=public

# Redis
REDIS_HOST=localhost
REDIS_PORT=56379
REDIS_DB=0
REDIS_PASSWORD=
NOTIFICATION_WORKER_CONCURRENCY=5

# Firebase Cloud Messaging (İsteyene Bağlı)
FCM_ENABLED=false
FCM_PROJECT_ID=
FCM_CLIENT_EMAIL=
FCM_PRIVATE_KEY=
```

#### Adım 3: Docker Servislerini Başlat

```bash
# Tüm servisleri başlat (PostgreSQL + Redis)
npm run infra:up

# Veya bireysel olarak
npm run db:up      # Sadece PostgreSQL
npm run redis:up   # Sadece Redis
```

Kontrol et:

```bash
docker compose ps
```

#### Adım 4: Geliştirme Serverini Başlat

```bash
npm run start:dev
```

Server `http://localhost:3000` adresinde çalışacaktır.

---

## 📥 Veri İmport

### Kur'an ve Hadis Verilerini İmport Et

```bash
npm run db:bulk-import
```

**Varsayılan kaynaklar:**

- Quran: `data/quran-uthmani.xml`
- Hadis: `data/tur-bukhari.json`, `data/tur-muslim.json`

**Özel kaynaklar belirtmek için:**

```bash
QURAN_SOURCE=/path/to/quran.xml \
HADITH_SOURCES=/path/to/book1.json,/path/to/book2.json \
npm run db:bulk-import
```

**Meal dosyası ile (Opsiyonel):**

```bash
QURAN_SOURCE=/path/to/quran.xml \
QURAN_MEAL_SOURCE=/path/to/meal.json \
HADITH_SOURCES=/path/to/book1.json,/path/to/book2.json \
npm run db:bulk-import
```

### Siyer-i Nebi Verilerini İmport Et

```bash
npm run content:siyer:import
```

**Özel kaynak belirtmek için:**

```bash
SIRAH_SOURCE=/path/to/siyer-nebi.json npm run content:siyer:import
```

**Mevcut verileri temizleyip yeniden import:**

```bash
SIRAH_IMPORT_TRUNCATE=true npm run content:siyer:import
```

---

## 🔍 API Dokumentasyon

Swagger UI üzerinden tüm API endpoint'lerine göz at:

```
http://localhost:3000/api/docs
```

**Temel Endpoint'ler:**

| Endpoint               | Metod | Açıklama                                       |
| ---------------------- | ----- | ---------------------------------------------- |
| `/api/quran/ayahs/:id` | GET   | Ayeti getir                                    |
| `/api/quran/search`    | POST  | Kur'an'da arama yap                            |
| `/api/hadith/search`   | POST  | Hadis kütüphanesinde arama                     |
| `/api/prayer-times`    | POST  | Belirtilen tarih ve konum için namaz vakitleri |
| `/api/qibla/direction` | POST  | Bulunulan konumdan kıble yönü                  |
| `/api/sirah/search`    | POST  | Siyer verisinde arama                          |

---

## 💻 Geliştirme

### Geliştirme Serverini Başlat

```bash
npm run start:dev
```

Hot-reload otomatik etkindir (`ts-node-dev`).

### Derle

```bash
npm run build
```

Derlenmiş kod `dist/` klasöründe oluşturulur.

### Üretim Modunda Çalıştır

```bash
npm run build
npm start
```

---

## 📊 Performans & Yük Testleri

### Veritabanı Performans Raporu

```bash
npm run perf:db
```

Query planları ve çalışma sürelerini analiz et.

### Yük Testleri

```bash
# Arama API'sı
npm run perf:load:search

# Namaz Vakitleri
npm run perf:load:prayer

# Senkronizasyon
npm run perf:load:sync

# Bildirimler
npm run perf:load:notifications

# Tümünü test et
npm run perf:load:all
```

---

## 🔧 Teknik Notlar

### Veritabanı Tasarımı

- ✅ **Tüm tablolarda UUID** birincil anahtar kullanılır
- ✅ **Full-Text Search** - `ayahs`, `hadiths`, `kissas`, `sirahs` tablolarında `search_vector` (PostgreSQL tsvector)
- ✅ **GIN Index** - Arama performansı için optimize edilmiş
- ✅ **Otomatik Updating** - Tetikleyici fonksiyonlar `search_vector`'ü otomatik günceller

### Hunspell Sözlük Entegrasyonu

Türkçe ve Arapça kök bulma için Hunspell sözlükleri ekle:

```bash
docker/postgres/hunspell/
├── tr_tr.aff       # Türkçe affix kuralları
├── tr_tr.dict      # Türkçe sözlük
├── ar.aff          # Arapça affix kuralları
└── ar.dict         # Arapça sözlük
```

Dosyalar yoksa sistem otomatik fallback FTS mapping'i kullanır.

### Text Search Konfigürasyonu

- `mizan_tr` - Türkçe metin araması (Hunspell genişletmeli)
- `mizan_ar` - Arapça metin araması (Hunspell genişletmeli)

### Sequelize Optimizasyonu

- Ham `raw` sorgu sonuçları performans için standardize edilmiş
- Kompleks sorgular için eager loading
- Batch işlemler için transaction desteği

---

## 📱 React Native Frontend

Mobil istemci uygulaması React Native + Expo ile `frontend/` klasöründe geliştirilir.

### Frontend Teknoloji Yığını

- React Native + Expo
- TypeScript
- NativeWind (Tailwind CSS yaklaşımı)
- React Navigation (ekran akışları)

### Frontend Kurulum

```bash
cd frontend
npm install
```

### Geliştirme Modunda Çalıştırma

```bash
npm start
```

Expo Developer Tools açıldıktan sonra:

- iOS Simülatör: `i`
- Android Emülatör: `a`
- Web Önizleme: `w`

### Backend ile Birlikte Çalıştırma

Frontend’in backend API’lerine bağlanabilmesi için backend servisinin ayakta olması gerekir:

```bash
# proje kökünde
npm run infra:up
npm run start:dev

# ayrı terminalde frontend
cd frontend
npm start
```

### Frontend Tasarım Kaynakları

- Ekran tasarım örnekleri: `frontend/design/`
- Uygulama ekranları: `frontend/src/screens/`
- Ortak bileşenler: `frontend/src/components/`
- Tema ayarları: `frontend/src/theme.ts`

---

## 🚨 Troubleshooting

### PostgreSQL Bağlantı Hatası

```bash
# Kontrol et
docker compose logs db

# Restart et
npm run db:down
npm run db:up
```

### Redis Bağlantı Hatası

```bash
docker compose logs redis
npm run redis:up
```

### Veri İmport Hatası

```bash
# Log'ları kontrol et
npm run db:bulk-import 2>&1 | tail -50

# Veri dosyalarını doğrula
ls -la data/
```

---

## 📝 Teknik Notlar (Detaylı)

### Bildirim Altyapısı (Phase 4)

Asenkron push notification sistemi:

- **Queue Manager:** Redis + BullMQ
- **Target Platform:** Firebase Cloud Messaging (FCM)
- **Modes:**
  - 🔔 Görünen Push Notifications
  - 🔇 Silent Sync Push (arka planda veri senkronizasyonu)
- **Fallback:** FCM kapalıysa sistem normal çalışmaya devam eder

**Bildirim Environment Değişkenleri:**

```env
FCM_ENABLED=true/false
FCM_PROJECT_ID=your-project-id
FCM_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
FCM_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

REDIS_HOST=localhost
REDIS_PORT=56379
NOTIFICATION_WORKER_CONCURRENCY=5
```

---

## 🔧 Operasyon Komutları

### Docker Yönetimi

```bash
# Tüm servisleri başlat
npm run infra:up

# Tüm servisleri durdur
npm run db:down

# Logları izle
npm run db:logs       # PostgreSQL logs
npm run redis:logs    # Redis logs

# Container durumunu kontrol et
docker compose ps
```

### Veri Yönetimi

```bash
# Tümünü import et (Kur'an + Hadis + Siyer)
npm run db:bulk-import

# Sadece Siyer'i import et
npm run content:siyer:import

# Siyer'i sıfırla ve yeniden import et
SIRAH_IMPORT_TRUNCATE=true npm run content:siyer:import

# Siyer dosyasını extract et (yeni versiyon)
npm run content:siyer:extract
```

### İzleme ve Raporlama

```bash
# Veritabanı performans raporu
npm run perf:db

# Yük testleri
npm run perf:load:search         # Arama API testi
npm run perf:load:prayer         # Namaz Vakitleri testi
npm run perf:load:sync           # Senkronizasyon testi
npm run perf:load:notifications  # Bildirim testi
npm run perf:load:all            # Tüm testler
```

---

## 🌍 Environment Referansı

**Tüm Ortam Değişkenleri:**

| Variable                          | Type    | Default   | Açıklama                |
| --------------------------------- | ------- | --------- | ----------------------- |
| `PORT`                            | number  | 3000      | Server port             |
| `DB_HOST`                         | string  | localhost | PostgreSQL host         |
| `DB_PORT`                         | number  | 55432     | PostgreSQL port         |
| `DB_NAME`                         | string  | -         | Veritabanı adı          |
| `DB_USER`                         | string  | -         | DB kullanıcısı          |
| `DB_PASSWORD`                     | string  | -         | DB parolası             |
| `DB_SCHEMA`                       | string  | public    | DB şeması               |
| `REDIS_HOST`                      | string  | localhost | Redis host              |
| `REDIS_PORT`                      | number  | 56379     | Redis port              |
| `REDIS_DB`                        | number  | 0         | Redis DB index          |
| `REDIS_PASSWORD`                  | string  | -         | Redis parolası          |
| `NOTIFICATION_WORKER_CONCURRENCY` | number  | 5         | Paralel bildirim işleme |
| `FCM_ENABLED`                     | boolean | false     | FCM etkin mi            |
| `FCM_PROJECT_ID`                  | string  | -         | Firebase Proje ID       |
| `FCM_CLIENT_EMAIL`                | string  | -         | Firebase Client Email   |
| `FCM_PRIVATE_KEY`                 | string  | -         | Firebase Private Key    |

---

## 🤝 Katkıda Bulunun

### İçerik Katkısı

Yeni Kur'an, Hadis veya Siyer içerikleri eklemek için:

1. **Veri Formatını Doğrula**
   - Kur'an: XML (Uthmani format)
   - Hadis: JSON (Bölüm, Hadis Numarası, Metin)
   - Siyer: JSON (Dönem, Olay, Açıklama)

2. **Veri Dosyasını Ekle**

   ```bash
   cp your-data.json data/
   ```

3. **Import Et**
   ```bash
   HADITH_SOURCES=data/your-data.json npm run db:bulk-import
   ```

### Kod Katkısı

1. **Fork et** → Klon al → Branch oluştur
2. **Kod yazıp test et**
3. **Pull Request gönder**

---

## 📦 NPM Scripts Özeti

```bash
npm run build              # TypeScript'i derle
npm run start              # Üretimde çalıştır
npm run start:dev          # Geliştirmede çalıştır (hot-reload)
npm run db:up              # PostgreSQL başlat
npm run redis:up           # Redis başlat
npm run infra:up           # İkisini de başlat
npm run db:down            # Tüm servisleri durdur
npm run db:logs            # PostgreSQL loglarını izle
npm run redis:logs         # Redis loglarını izle
npm run db:bulk-import     # Kur'an, Hadis, Siyer import et
npm run content:siyer:import       # Siyer import et
npm run content:siyer:extract      # Siyer extract et
npm run perf:db            # DB performans raporu
npm run perf:load:search   # Arama yükleme testi
npm run perf:load:prayer   # Namaz vakti yükleme testi
npm run perf:load:sync     # Sinkronizasyon yükleme testi
npm run perf:load:notifications    # Bildirim yükleme testi
npm run perf:load:all      # Tüm testler
```

---

## 🎓 Öğrenme Kaynakları

- [NestJS Documentation](https://docs.nestjs.com/)
- [Sequelize Documentation](https://sequelize.org/)
- [PostgreSQL Full-Text Search](https://www.postgresql.org/docs/current/textsearch.html)
- [Redis Documentation](https://redis.io/documentation)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)

---

## 🧑‍💻 Proje Yapısı

```
mizan-app/
├── frontend/               # React Native + Expo
│   ├── src/
│   │   ├── screens/       # UI Ekranları
│   │   ├── components/    # Reusable Bileşenler
│   │   ├── context/       # Global State (Location, vb)
│   │   ├── api/           # API İstemci
│   │   └── utils/         # Utility Fonksiyonları
│   └── package.json
│
├── src/                    # Backend (NestJS)
│   ├── domain/             # İş Mantığı & Entity'ler
│   ├── application/        # Use Case'ler & Soyutlamalar
│   │   ├── use-cases/     # İş Akışları
│   │   └── ports/         # Repository & Service Abstraksiyonları
│   ├── infrastructure/     # Teknik Implementation
│   │   ├── database/      # Sequelize Modelleri
│   │   ├── notification/  # FCM & BullMQ
│   │   ├── prayer/        # Namaz Vakti Hesaplama
│   │   ├── qibla/         # Kıble Pusulası
│   │   ├── search/        # Full-Text Search
│   │   └── sync/          # Senkronizasyon
│   ├── presentation/       # HTTP Katmanı
│   │   ├── controllers/   # API Endpoint'leri
│   │   └── dto/           # Data Transfer Objects
│   ├── scripts/           # Veri Import Scriptleri
│   ├── types/             # TypeScript Definitions
│   ├── app.module.ts      # Root Module
│   └── main.ts            # Application Entry Point
│
├── data/                   # Veri Dosyaları
│   ├── quran-uthmani.xml
│   ├── tur-bukhari.json
│   ├── tur-muslim.json
│   ├── siyer-nebi.json
│   └── tr.diyanet.xml
│
├── docker/                 # Docker Konfigürasyonu
│   └── postgres/
│       ├── init/          # Veritabanı İnitializer
│       └── hunspell/      # Türkçe/Arapça Sözlükler
│
├── scripts/               # Performance Test Scriptleri
├── docker-compose.yml     # Container Orkestrasyon
├── package.json           # Node.js Bağımlılıkları
└── tsconfig.json          # TypeScript Konfigürasyonu
```

---

## 📊 Veritabanı Tasarımı

**Ana Tablolar:**

- `ayahs` - Kur'an Ayetleri (6,236 kayıt)
- `hadiths` - Hadis Koleksiyonu
- `sirahs` - Siyer-i Nebi (İslam Tarihi)
- `meals` - Ayetler için Tefsir/Anlamlar
- `devices` - Kullanıcı Cihazları (FCM Token)
- `notifications` - Gönderilen Bildirimler (Audit Trail)

**Index Stratejisi:**

- GIN Index tüm `search_vector` kolonnlarında
- B-Tree Index primer ve foreign key'lerde
- Composite Index sık sorgulanan kolon kombinasyonlarında

---

## ⚡ Performans Optimizasyonları

✅ **Veritabanı:**

- Raw SQL sorgular
- Connection pooling
- Query result caching

✅ **Backend:**

- Redis caching layer
- BullMQ job queue
- Batch processing

✅ **Full-Text Search:**

- PostgreSQL GIN indexes
- Hunspell morphological analyzer
- Trigram similarity search

---

## 💬 İletişim & Destek

- **Email:** recepyyuksel@gmail.com

---

## 🙏 Teşekkürler

Bu proje aşağıdakiler tarafından mümkün kılınmıştır:

- **Quran-Meta** - Kur'an metatekleri
- **Hunspell** - Türkçe/Arapça spellcheck
- **NestJS** - Modern Node.js framework
- **PostgreSQL** - Güçlü açık kaynak veritabanı
- **Redis** - İn-memory veri depolama
- **Firebase** - Cloud messaging

---

