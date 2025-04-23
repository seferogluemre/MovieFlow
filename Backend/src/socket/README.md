# Socket.io Architecture

Bu klasör yapısı, real-time iletişim için Socket.io ile ilgili tüm bileşenleri organize bir şekilde yönetmek için tasarlanmıştır.

## Dosya Yapısı

```
socket/
  ├── index.ts                  # Ana Socket.io başlatma ve global erişim noktası
handlers/
  ├── socket/
      ├── index.ts              # Tüm Socket.io event handler'larını birleştiren dosya
      ├── connection.handler.ts # Bağlantı ve bağlantı kesme olaylarını yöneten handler
      ├── friend.handler.ts     # Arkadaşlık istekleriyle ilgili olayları yöneten handler
      └── userStatus.handler.ts # Kullanıcı durumu (online/offline) olaylarını yöneten handler
middlewares/
  ├── socket.middleware.ts      # Socket.io için kimlik doğrulama middleware'i
services/
  ├── socket/
      └── notification.service.ts # Bildirim gönderme hizmetleri
types/
  ├── socket.types.ts           # Socket.io ile ilgili tip tanımlamaları
utils/
  ├── socket/
      └── userStatus.ts         # Kullanıcı durumu yönetimi için yardımcı fonksiyonlar
```

## Kullanım

### Socket Server'ı Başlatma

```typescript
import { initSocketServer } from './socket';
import { createServer } from 'http';
import express from 'express';

const app = express();
const httpServer = createServer(app);

// Socket.io server'ı başlat
initSocketServer(httpServer);

httpServer.listen(3000);
```

### Bildirim Gönderme

```typescript
import { sendNotification } from './socket';

// Bir kullanıcıya bildirim gönder
sendNotification(
  userId,         // hedef kullanıcı ID
  'friend_request', // bildirim tipi
  'Yeni bir arkadaşlık isteği aldınız', // mesaj
  senderUserId,   // gönderen kullanıcı ID
  {},             // ek veri (opsiyonel)
  true            // veritabanına kaydet (opsiyonel)
);
```

### Kullanıcı Durumu Kontrolü

```typescript
import { isUserOnline, getOnlineUsers } from './socket';

// Bir kullanıcının çevrimiçi olup olmadığını kontrol et
const userIsOnline = isUserOnline(userId);

// Tüm çevrimiçi kullanıcıların listesini al
const onlineUserIds = getOnlineUsers();
``` 