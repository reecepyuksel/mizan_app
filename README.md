# Mizan Backend (Faz 1)

Bu proje, Mizan modern Islami Yasam Rehberi icin NestJS + PostgreSQL + Sequelize tabanli Faz 1 backend altyapisidir.

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

## Calistirma

1. Ortam degiskenlerini hazirla:

```bash
cp .env.example .env
```

2. PostgreSQL'i Docker ile kaldir:

```bash
npm run db:up
```

3. Uygulamayi gelistirme modunda baslat:

```bash
npm run start:dev
```

4. Derleme:

```bash
npm run build
```

## Ornek Endpointler

- `GET /api/search/ayahs?q=rahmet&limit=20`
- `GET /api/search/hadiths?q=merhamet&limit=20`
- `GET /api/search/kissas?q=sabir&limit=20`
