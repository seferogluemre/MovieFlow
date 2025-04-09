# MovieFlow

MovieFlow, film tutkunları için geliştirilmiş bir sosyal film platformudur. Kullanıcılar filmleri keşfedebilir, değerlendirebilir, arkadaşlarıyla etkileşime geçebilir ve film deneyimlerini paylaşabilirler.

## 🚀 Özellikler

- 🎬 Film Keşfetme ve Arama
- ⭐ Film Değerlendirme ve Puanlama
- 👥 Sosyal Etkileşim ve Arkadaşlık Sistemi
- 📝 Film İncelemeleri
- 📋 İzleme Listesi ve İstek Listesi
- 📚 Kişisel Film Kütüphanesi
- 🔔 Bildirim Sistemi

## 🛠️ Teknolojiler

### Backend
- **Node.js & Express**: API geliştirme
- **TypeScript**: Tip güvenliği ve geliştirici deneyimi
- **Prisma**: ORM ve veritabanı yönetimi
- **PostgreSQL**: Veritabanı
- **JWT**: Kimlik doğrulama
- **Zod**: Veri doğrulama
- **Multer**: Dosya yükleme işlemleri
- **Helmet**: Güvenlik önlemleri
- **Express Rate Limit**: API rate limiting

## 📁 Proje Yapısı

```
Backend/
├── src/
│   ├── config/         # Konfigürasyon dosyaları
│   ├── constants/      # Sabit değerler
│   ├── controller/     # API controller'ları
│   ├── logs/          # Log dosyaları
│   ├── middlewares/   # Express middleware'leri
│   ├── routes/        # API rotaları
│   ├── schemas/       # Veri şemaları
│   ├── services/      # İş mantığı servisleri
│   ├── types/         # TypeScript tip tanımlamaları
│   ├── utils/         # Yardımcı fonksiyonlar
│   ├── validators/    # Veri doğrulama
│   └── server.ts      # Ana sunucu dosyası
├── prisma/            # Prisma şema ve migrasyonları
├── public/            # Statik dosyalar
└── .env              # Ortam değişkenleri
```

## 🚀 Kurulum

1. Projeyi klonlayın:
```bash
git clone https://github.com/yourusername/MovieFlow.git
cd MovieFlow
```

2. Bağımlılıkları yükleyin:
```bash
cd Backend
pnpm install
```

3. Veritabanı ayarlarını yapın:
- `.env` dosyasını oluşturun ve gerekli değişkenleri ayarlayın
- Prisma migrasyonlarını çalıştırın:
```bash
pnpm prisma migrate dev
```

4. Geliştirme sunucusunu başlatın:
```bash
pnpm dev
```

## 🔒 Güvenlik

- JWT tabanlı kimlik doğrulama
- Rate limiting
- Helmet güvenlik başlıkları
- CORS yapılandırması
- Veri doğrulama (Zod)
- Güvenli şifre hashleme (bcrypt)

## 📝 API Dokümantasyonu

API dokümantasyonu için [API.md](API.md) dosyasını inceleyebilirsiniz.

## 🤝 Katkıda Bulunma

1. Fork'layın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasını inceleyebilirsiniz.
