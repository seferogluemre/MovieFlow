import { getS3Url } from "@utils/services/s3-upload.util";
import nodemailer from "nodemailer";

export async function sendRecommendationEmail(
  email: string,
  name: string,
  movies: any[]
) {
  // Film bilgilerini güvenli bir şekilde kontrol ederek alın
  const movieList = movies.map((movie) => {
    // Filmin kendisi veya movie özelliği içindeki bilgiler
    const movieData = movie.movie || movie;

    // Başlık
    const title = movieData.title || "İsimsiz Film";

    // Yıl bilgisi - farklı alanlarda olabilir
    const year = movieData.year || movieData.releaseYear || "?";

    // Poster URL - farklı alanlarda olabilir
    let posterPath = movieData.posterUrl || movieData.posterImage;

    // Varsayılan poster - görsel sorunlarını önler
    const defaultPosterUrl =
      "https://placehold.co/400x600/333/white?text=Film+Posteri";

    // Eğer S3 key varsa, URL'ye dönüştür
    let posterUrl;
    try {
      if (posterPath) {
        // Eğer zaten tam URL ise kullan, değilse S3 URL'si oluştur
        posterUrl = posterPath.startsWith("http")
          ? posterPath
          : getS3Url(posterPath);
      } else {
        posterUrl = defaultPosterUrl;
      }
    } catch (error) {
      console.error(`Poster URL oluşturma hatası (${title}):`, error);
      posterUrl = defaultPosterUrl;
    }

    console.log(
      `Film işleniyor: ${title}, ${year}, Poster: ${
        posterUrl ? posterUrl.substring(0, 50) + "..." : "Yok"
      }`
    );

    return { title, year, posterUrl };
  });

  console.log("İşlenecek film listesi:", movieList);

  // OnlyJS Movie Platform logosu - güvenilir public URL
  const logoPath = `https://media.licdn.com/dms/image/v2/D4D0BAQH79hdedK8kCQ/company-logo_100_100/company-logo_100_100/0/1712151935277/onlyjs_technology_logo?e=1750896000&v=beta&t=Ijh6xb1_MYKrvcW6Z5TvxHxy1skt4c5a3vKrZCip1nU`;

  // HTML içeriği oluştur
  const htmlContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
        background-color: #1a1a1a;
        color: white;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
      }
      .header {
        background-color: transparent;
        padding: 10px 0;
        display: flex;
        align-items: center;
      }
      .logo {
        width: 70px;
        height: 70px;
        border-radius: 50%;
        margin-right: 10px;
        overflow: hidden;
      }
      .header-text {
        font-size: 18px;
        font-weight: bold;
      }
      .content {
        padding: 20px 0;
      }
      h1 {
        font-size: 24px;
        margin-bottom: 20px;
        color: #4CAF50;
      }
      .movie-list {
        margin-top: 20px;
      }
      .movie-item {
        display: flex;
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 1px solid #333;
        background-color: #222;
        border-radius: 8px;
        padding: 15px;
      }
      .movie-poster {
        width: 100px;
        margin-right: 15px;
      }
      .movie-poster img {
        width: 100%;
        height: auto;
        border-radius: 5px;
      }
      .movie-info {
        flex: 1;
      }
      .movie-info h3 {
        margin-top: 0;
        color: #e4e4e4;
      }
      .movie-info p {
        color: #aaa;
      }
      .footer {
        margin-top: 20px;
        font-size: 12px;
        color: #888;
        text-align: center;
        border-top: 1px solid #333;
        padding-top: 15px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="logo">
          <img src="${logoPath}" 
          alt="OnlyJS Movie Platform" 
          style="width: 100%; height: 100%; object-fit: cover;" />
        </div>
        <div class="header-text">OnlyJS Movie Platform</div>
      </div>

      <div class="content">
        <h1>Film Önerilerin Hazır!</h1>
        <p>Merhaba <strong>${name || "Film Sever"}</strong>,</p>
        <p>Kütüphanende uzun süredir izlemediğin filmler var. İşte sana önerdiğimiz filmler:</p>
        
        <div class="movie-list">
          ${movieList
            .map(
              (movie) => `
            <div class="movie-item">
              <div class="movie-poster">
                <img src="${movie.posterUrl}" alt="${movie.title}">
              </div>
              <div class="movie-info">
                <h3>${movie.title}</h3>
                <p>Yıl: ${movie.year}</p>
              </div>
            </div>
          `
            )
            .join("")}
        </div>
        
        <p>İyi seyirler dileriz!</p>
      </div>

      <div class="footer">
        <p>© ${new Date().getFullYear()} OnlyJS Movie Platform. Tüm hakları saklıdır.</p>
        <p>Bu e-posta otomatik olarak gönderilmiştir. Lütfen cevaplamayınız.</p>
      </div>
    </div>
  </body>
  </html>
  `;

  const transporter = nodemailer.createTransport({
    host: "smtp.mail.me.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: `"OnlyJS Movie Platform" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Kütüphanendeki İzlenmemiş Filmler!",
    text: `Merhaba ${
      name || "Film Sever"
    },\n\nKütüphanende uzun süredir izlemediğin filmler var:\n\n${movieList
      .map((m) => `${m.title} (${m.year})`)
      .join("\n")}\n\nBunlara tekrar bakmaya ne dersin?`,
    html: htmlContent,
  };

  console.log(
    `[${new Date().toISOString()}] "${email}" adresine mail gönderiliyor...`
  );
  await transporter.sendMail(mailOptions);
  console.log(
    `[${new Date().toISOString()}] "${email}" adresine mail başarıyla gönderildi!`
  );
}
