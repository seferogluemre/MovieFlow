
## Örnek Kullanım (Frontend)

```typescript
// Doğrulama e-postası gönderme
async function sendVerificationEmail(email: string) {
  try {
    const response = await fetch('/api/mail/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Bir hata oluştu');
    }
    
    return data;
  } catch (error) {
    console.error('Doğrulama e-postası gönderme hatası:', error);
    throw error;
  }
}

// Doğrulama kodunu kontrol etme
async function verifyEmail(email: string, code: string) {
  try {
    const response = await fetch('/api/mail/verify-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, code })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Bir hata oluştu');
    }
    
    return data;
  } catch (error) {
    console.error('E-posta doğrulama hatası:', error);
    throw error;
  }
}
``` 