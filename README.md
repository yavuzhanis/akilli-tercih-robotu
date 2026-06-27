# Akıllı Tercih Sistemi

Aday öğrenciler için premium bölüm keşif, karşılaştırma ve tercih listesi sistemi.

## İçerik

- `index.html`: Ana sayfa
- `assets/js/program-data.js`: Kapadokya Üniversitesi 2025 YKS resmi aday sayfasından modellenen program veri katmanı
- `assets/css/style.css`: Tasarım dosyası
- `assets/js/app.js`: Filtreleme, öneri skoru ve tercih listesi mantığı
- `assets/js/admin.js`: Admin paneli giriş, rol bazlı listeleme, güncelleme ve CSV dışa aktarma mantığı
- `server/index.js`: Statik siteyi ve Prisma tabanlı JSON API endpointlerini servis eden Node backend
- `prisma/schema.prisma`: Program, aday kayıt, admin kullanıcı ve tercih ilişkisi veritabanı modeli
- `prisma/seed.js`: Kapadokya Üniversitesi resmi programlarını SQLite veritabanına yükleyen seed scripti
- `prisma/backup-db.js`: Yerel SQLite veritabanı için tek komutla yedek alma scripti

## Özellikler

- Puan türü, ilgi alanı, eğitim türü, dil, süre ve burs filtreleri
- Arama ve sıralama kontrollü bölüm kartları
- Uyum skoru, öneri gerekçesi ve detay modalı
- Seçilen programları yan yana karşılaştırma
- Karşılaştırma tablosunda en iyi değer vurguları
- Tercih listesinde yukarı/aşağı sıralama
- URL hash ile paylaşılabilir program detayı
- Tarayıcıda saklanan tercih listesi
- Tercih listesini kopyalama ve yazdır/PDF çıktısı alma
- E-posta/telefon doğrulamalı KVKK uyarılı demo aday bilgi formu
- Açık varsayılan arka plan, koyu/açık tema anahtarı ve DIN Pro öncelikli font zinciri
- Mobil menü, filtre linki paylaşımı ve URL üzerinden filtreyi geri yükleme
- KVKK bilgilendirme modalı, telefon formatlama ve form gönderim durumları
- Mobil karşılaştırma kartları, boş veri/sonuç durumları ve güvenli çıktı render yaklaşımı
- Prisma + SQLite backend API bağlantısı, program listeleme ve aday kayıt endpointleri
- Token korumalı admin paneli, aday durum güncelleme, kayıt silme ve CSV dışa aktarma
- Admin program kataloğu: program ekleme, düzenleme, yayına alma ve pasife alma
- Excel/CSV program import sistemi: şablon indirme, doğrulama, create/upsert modu
- Admin listelerinde server-side arama, filtreleme, sayfalama ve tüm filtre için CSV çıktı
- Admin raporlama: tarih aralıklı aday performansı, pipeline, kaynak, program ve danışman metrikleri ile CSV çıktı
- Panel içi bildirim merkezi, yeni aday bildirimi ve takip hatırlatma kayıtları
- E-posta/SMS mesajlaşma: düzenlenebilir şablonlar, lokal onaylı test modu, SMTP ile gerçek e-posta gönderimi, Textbelt SMS sağlayıcısı ve gönderim geçmişi
- Admin kullanıcı/rol sistemi: admin, danışman ve editör yetkileri
- Rol bazlı veri kapsamı: danışmanlar kendi/atanmamış aday havuzunu, editörler aday verisi olmadan program kataloğunu görür
- Admin site ayarları: marka, hero, footer, iletişim ve KVKK metni yönetimi
- Adaylara danışman atama, randevu tarihi/notu ve randevu hatırlatma bildirimi
- Audit log: admin girişleri, aday, program, kullanıcı, ayar ve bildirim işlemleri için işlem geçmişi
- CRM/webhook entegrasyonu: aday oluşturma/güncelleme olaylarını imzalı webhook ile dış sisteme aktarma
- Ürün odaklı aday pipeline’ı: yeni, görüşüldü, randevu, başvurdu, kayıt oldu, vazgeçti, arşiv
- Canlı ortam güvenlik sertleştirme: production env doğrulaması, CORS allowlist, güvenlik headerları, rate limit, audit retention ve SQLite yedekleme komutu
- Kapadokya Üniversitesi bilgisi: program kartlarında üniversite adı, sayfada kampüs/iletişim/kaynak özeti

## Çalıştırma

İlk kurulum için:

```bash
npm install
npm run db:setup
```

Backend ile çalıştırmak için:

```bash
npm run dev
```

Sonra tarayıcıdan şu adrese gidin:

```text
http://localhost:3000
```

Statik dosyayı doğrudan açarsanız frontend lokal resmi veri dosyasını kullanır. Backend çalışıyorsa program verisi ve aday kayıtları API üzerinden Prisma/SQLite katmanına bağlanır.

## Admin Paneli

```text
http://localhost:3000/admin
```

Yerel geliştirme varsayılan admin hesabı:

```text
admin@example.com / admin123
```

Canlı ortamda şu değerleri ortam değişkeni olarak değiştirin:

```bash
NODE_ENV="production"
PUBLIC_ORIGIN="https://tercih.kurumunuz.com"
ALLOWED_ORIGINS="https://tercih.kurumunuz.com"
ADMIN_EMAIL="admin@kurumunuz.com"
ADMIN_NAME="Sistem Admin"
ADMIN_PASSWORD="en-az-12-karakterli-guclu-bir-sifre"
ADMIN_SESSION_SECRET="32-karakterden-uzun-rastgele-bir-secret"
SMTP_HOST="smtp.kurumunuz.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="mail@kurumunuz.com"
SMTP_PASS="mail-sifresi"
SMTP_FROM="mail@kurumunuz.com"
SMTP_FROM_NAME="Akıllı Tercih Sistemi"
SMTP_TEST_MODE="false"
SMS_PROVIDER="textbelt"
SMS_API_KEY="canli-sms-api-key"
SMS_TEST_MODE="false"
```

Canlı modda varsayılan admin şifresi, kısa oturum gizli anahtarı ve boş origin listesi ile server başlamaz. Örnek değerler için `.env.example` dosyasını kullanın.
Lokal geliştirme için `.env` dosyasında `SMTP_TEST_MODE=true` ve `SMS_TEST_MODE=true` açık gelir; admin mesaj gönderiminde test onaylı `sent` kaydı üretir. Canlı modda bu iki test bayrağı açık kalırsa server başlamaz. Gerçek e-posta için SMTP değerlerini, gerçek SMS için Textbelt veya farklı sağlayıcı anahtarını girin.

Admin panelinde şu an yönetilebilen ana alanlar:

- Aday kayıtları ve danışman notları
- Aday pipeline durumu
- Aday danışman ataması
- Aday randevu tarihi ve randevu notu
- Aday takip zamanı ve takip notu
- Program kataloğu
- Program yayın/pasif durumu
- CSV ile toplu program importu
- CSV aday çıktısı
- Tarih aralıklı aday raporu ve rapor CSV çıktısı
- E-posta/SMS şablon yönetimi ve aday detayından mesaj gönderimi
- Mesaj gönderim geçmişi, kanal/durum filtreleri ve aday görüşme geçmişine otomatik kayıt
- Program ilgi istatistikleri
- Aday ve program listelerinde backend destekli arama/filtre/sayfalama
- Sekmeli operasyon düzeni: özet, raporlama, bildirimler, mesajlaşma, adaylar, programlar, kullanıcılar, ayarlar, entegrasyonlar, işlem geçmişi, eksikler
- Aday detay penceresi ve görüşme geçmişi
- Bildirim merkezi, okundu/okunmadı yönetimi ve zamanı gelen takip özeti
- Admin kullanıcıları ve rol bazlı panel erişimi
- Marka, iletişim, footer, hero ve KVKK site ayarları
- Yaklaşan randevu ve atanmamış aday dashboard metrikleri
- İşlem geçmişi: kullanıcı, aksiyon, hedef kayıt, detay ve metadata filtreleri
- CRM webhook ayarı, test gönderimi ve gönderim geçmişi takibi
- Danışman kapsamı: aday listesi, rapor, bildirim ve mesaj geçmişi kendi/atanmamış adaylarla sınırlı

Rol yetkileri:

```text
admin     Tüm aday, program ve kullanıcı işlemleri
advisor   Kendine atanmış ve atanmamış adaylarda durum/not, randevu, mesaj ve görüşme geçmişi
editor    Aday verisi olmadan program kataloğu yönetimi
```

## Veritabanı

```text
Program     Bölüm/program kayıtları
Lead        Aday bilgi formu, atama, randevu ve takip kayıtları
LeadChoice  Adayın seçtiği program sırası
LeadActivity Aday görüşme/not geçmişi
AdminNotification Panel içi bildirim ve takip hatırlatmaları
AdminUser   Admin paneli kullanıcıları ve rolleri
SiteSetting Marka, iletişim ve KVKK site ayarları
AdminAuditLog Admin işlem geçmişi ve güvenlik kayıtları
CrmIntegration CRM webhook ayarları
CrmDeliveryLog CRM gönderim geçmişi ve hata kayıtları
MessageTemplate E-posta/SMS şablonları
MessageDeliveryLog E-posta/SMS gönderim geçmişi
```

Yararlı komutlar:

```bash
npm run db:migrate
npm run db:seed
npm run db:backup
npm run db:studio
```

`npm run db:backup` komutu `prisma/dev.db` dosyasını `backups/` klasörüne zaman damgalı olarak kopyalar. `backups/` ve `.env` dosyaları git dışında tutulur.

## API

```text
GET  /api/health
GET  /api/settings
GET  /api/programs
GET  /api/programs/:id
POST /api/leads
POST /api/admin/login
GET  /api/admin/session
GET  /api/admin/settings
PATCH /api/admin/settings
GET  /api/admin/advisors
GET  /api/admin/stats
GET  /api/admin/reports/leads?startDate=&endDate=
GET  /api/admin/audit-logs?q=&action=&entityType=&page=&pageSize=
GET  /api/admin/crm
PATCH /api/admin/crm
POST /api/admin/crm/test
GET  /api/admin/crm/deliveries?q=&status=&event=&page=&pageSize=
GET  /api/admin/messaging
PATCH /api/admin/messaging/templates/:id
GET  /api/admin/messaging/deliveries?q=&channel=&status=&page=&pageSize=
GET  /api/admin/notifications?status=&type=&page=&pageSize=
PATCH /api/admin/notifications/:id
POST /api/admin/notifications/read-all
GET  /api/admin/leads?q=&status=&page=&pageSize=
GET  /api/admin/leads/:id
PATCH /api/admin/leads/:id
DELETE /api/admin/leads/:id
POST /api/admin/leads/:id/activities
POST /api/admin/leads/:id/messages
GET  /api/admin/programs?q=&status=&page=&pageSize=
POST /api/admin/programs
POST /api/admin/programs/import
PATCH /api/admin/programs/:id
DELETE /api/admin/programs/:id
GET  /api/admin/users
POST /api/admin/users
PATCH /api/admin/users/:id
DELETE /api/admin/users/:id
```

## Ürün Yol Haritası

Ana front, backend ve admin eksik listesi tamamlandı. Product öncesi sıradaki kontrol KVKK/onay metni, domain/SSL kurulumu, canlı SMTP/SMS/CRM sağlayıcıları ve kullanıcı kabul testidir.

## Ücretsiz Yayın

Render ücretsiz web servisi için `render.yaml` eklendi. Render, ücretsiz web servislerinde `onrender.com` subdomain ve yönetilen TLS sağlar. İlk yayın preview/test amaçlıdır:

```bash
npm run preflight:deploy
```

Render ayarları:

```text
Build Command: npm install && npm run preflight:deploy
Start Command: npm run start:render
Health Check: /api/health
```

Ücretsiz Render web servisinde dosya sistemi geçici olduğu için SQLite verisi redeploy/restart sonrası yeniden seed edilir. Kalıcı canlı kullanım için PostgreSQL veya ücretli persistent disk gerekir. Render ücretsiz web servislerinde SMTP portları 25/465/587 outbound kapalı olduğu için ilk yayın test onaylı mail/SMS moduyla çalışır; canlı e-posta için HTTP API tabanlı sağlayıcı veya farklı sunucu planı gerekir.

## Not

Bu sürüm Kapadokya Üniversitesi aday sayfasındaki 2025 YKS puan ve kontenjan verilerini `assets/js/program-data.js` dosyasından seed ederek yerel SQLite veritabanına taşır. Aday kayıtları için KVKK/onay metinleri hukuk kontrolünden geçirilmeli ve canlı ortam değişkenleri `.env.example` üzerinden güvenli şekilde tanımlanmalıdır.
