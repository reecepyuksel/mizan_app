# Mizan Backend

Bu proje, Mizan modern Islami Yasam Rehberi icin NestJS + PostgreSQL + Sequelize tabanli backend servisidir. Mevcut durumda Faz 1-4 kapsamindaki arama, icerik, namaz vakti, kivle, offline sync ve bildirim altyapilari repoda bulunur.

## Mimari

Clean Architecture 4 katman:

- `src/domain`: Entity tanimlari
- `src/application`: Use Case'ler ve Port'lar
- `src/infrastructure`: Sequelize implementasyonlari, DB baglantisi, FTS trigger/index altyapisi
- `src/presentation`: HTTP Controller ve DTO

## Teknik Notlar

- Tum tablolarda birincil anahtar UUID'dir.
- `ayahs`, `hadiths`, `kissas` tablolarinda `search_vector` (tsvector) kolonu vardir.
- GIN index stratejisi uygulanmistir.
- Kayit ekleme/guncellemede `search_vector` alanlari trigger fonksiyonlariyla otomatik doldurulur.
- Sequelize sorgularinda performans icin ham sonuc (`raw`) kullanimi standartlastirilmistir.
- `mizan_tr` (Turkce) ve `mizan_ar` (Arapca) text search config'leri Hunspell genisletmesine hazir sekilde tanimlanmistir.

### Hunspell sozluk entegrasyonu

Gercek Hunspell kok bulma icin sozluk dosyalarini asagidaki klasore koy:

```bash
docker/postgres/hunspell/
```

Beklenen dosya adlari:

- `tr_tr.aff`
- `tr_tr.dict`
- `ar.aff`
- `ar.dict`

Not: Dosyalar yoksa sistem otomatik olarak fallback FTS mapping ile calismaya devam eder.

## Calistirma

1. Ortam degiskenlerini hazirla:

```bash
cp .env.example .env
```

2. Altyapi servislerini Docker ile kaldir:

```bash
npm run infra:up
```

Sadece PostgreSQL veya sadece Redis kaldirmak istersen:

```bash
npm run db:up
npm run redis:up
```

3. (Faz 2) Kur'an ve hadis verilerini PostgreSQL'e bulk aktar:

```bash
# Varsayilan kaynaklar:
# - Quran: data/quran-uthmani.xml
# - Hadis: data/tur-bukhari.json,data/tur-muslim.json
# - Opsiyonel meal birlestirme: data/quran.json
npm run db:bulk-import
```

Istersen kaynak dosya yollarini ortam degiskenleriyle verebilirsin:

```bash
QURAN_SOURCE=/path/to/quran.xml HADITH_SOURCES=/path/to/book1.json,/path/to/book2.json npm run db:bulk-import
```

Opsiyonel olarak Kur'an meal dosyasini ayrica birlestirmek icin:

```bash
QURAN_SOURCE=/path/to/quran.xml QURAN_MEAL_SOURCE=/path/to/quran-meal.json HADITH_SOURCES=/path/to/book1.json,/path/to/book2.json npm run db:bulk-import
```

4. Uygulamayi gelistirme modunda baslat:

```bash
npm run start:dev
```

5. Swagger dokumantasyonunu ac:

```bash
http://localhost:3000/api/docs
```

6. Derleme:

```bash
npm run build
```

## Faz 4 Bildirim Altyapisi

- Redis tabanli BullMQ kuyrugu ile asenkron bildirim isleme
- Cihaz bazli FCM token kaydi
- Gorunen push notification ve silent sync push akislari
- FCM kapaliysa veya kimlik bilgileri eksikse worker skip ederek sistemi ayakta tutar
- Faz 4 kapsamindaki kritik sorgular icin ek performans indeksleri bulunur
- Veritabani benchmark ve HTTP yük testi scriptleri bulunur

### Faz 4 Ortam Degiskenleri

```bash
REDIS_HOST=localhost
REDIS_PORT=56379
REDIS_DB=0
REDIS_PASSWORD=
NOTIFICATION_WORKER_CONCURRENCY=5

FCM_ENABLED=false
FCM_PROJECT_ID=
FCM_CLIENT_EMAIL=
FCM_PRIVATE_KEY=
```

`FCM_PRIVATE_KEY` tek satir olarak verilecekse satir sonlari `\n` seklinde yazilmalidir.

### Faz 4 Performans ve Yük Testleri

Veritabani sorgu plani ve surelerini almak icin:

```bash
npm run perf:db
```

HTTP yük testlerinde uygulama ayakta olmalidir:

```bash
npm run start:dev
npm run perf:load:search
npm run perf:load:prayer
npm run perf:load:sync
npm run perf:load:notifications
```

Tum HTTP senaryolarini arka arkaya calistirmak icin:

```bash
npm run perf:load:all
```

Opsiyonel perf ortam degiskenleri:

```bash
PERF_BASE_URL=http://localhost:3000
PERF_CONNECTIONS=20
PERF_DURATION=15
PERF_DEVICE_ID=phase4_device_1
PERF_SEARCH_TERM=rahmet
```

## Ornek Endpointler

- `GET /api/search/ayahs?q=rahmet&limit=20`
- `GET /api/search/hadiths?q=merhamet&limit=20`
- `GET /api/search/kissas?q=sabir&limit=20`
- `GET /api/prayer-times/daily?lat=41.0082&lon=28.9784&date=2026-04-09`
- `GET /api/prayer-times/range?lat=41.0082&lon=28.9784&startDate=2026-04-09&days=7`
- `GET /api/content/ayahs?surahNumber=1&page=1&limit=20`
- `GET /api/content/ayahs/:id`
- `GET /api/content/hadiths?page=1&limit=20`
- `GET /api/content/hadiths/:id`
- `GET /api/sync/pull?deviceId=device_abc_123&lastPulledAt=0`
- `POST /api/sync/push`
- `POST /api/notifications/devices/register`
- `POST /api/notifications/send`
- `POST /api/notifications/silent-sync`
