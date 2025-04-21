import prisma from "../config/database";
import mailQueue from "../queues/mail.queue";
import { sendRecommendationEmail } from "../utils/mail/sendMail.util";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

mailQueue.process(async (job) => {
  console.log(`\n[${new Date().toISOString()}] Mail worker çalışmaya başladı!`);
  console.log("------------------------------------------------------");

  try {
    console.log("1. Veritabanından kullanıcılar ve kütüphaneleri çekiliyor...");
    const users = await prisma.user.findMany({
      include: {
        library: {
          include: {
            movie: {
              select: {
                posterImage: true,
                title: true,
                director: true,
                releaseYear: true,
              },
            },
          },
          where: {
            OR: [
              {
                lastWatched: {
                  lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                },
              },
              {
                lastWatched: null,
              },
            ],
          },
        },
      },
    });

    // Log verilerin yapısını görmek için örnek bir kullanıcı
    if (users.length > 0 && users[0].library.length > 0) {
      console.log(
        "Örnek film verisi:",
        JSON.stringify(users[0].library[0].movie, null, 2)
      );
    }

    console.log(`2. Toplam ${users.length} kullanıcı bulundu.`);
    console.log("------------------------------------------------------");

    for (let i = 0; i < users.length; i++) {
      const user = users[i];

      if (user.library.length === 0) {
        console.log(
          `Kullanıcı ${user.email}: Kütüphanede film bulunamadı, geçiliyor.`
        );
        continue;
      }

      console.log(
        `3. [${i + 1}/${users.length}] "${user.email}" kullanıcısı işleniyor.`
      );
      console.log(`   - Kütüphanesinde ${user.library.length} film var.`);

      await sendRecommendationEmail(user.email, user.name!, user.library);

      if (i < users.length - 1) {
        console.log(
          `   - Sonraki kullanıcıya geçmeden önce 2 saniye bekleniyor...`
        );
        await sleep(2000);
        console.log("------------------------------------------------------");
      }
    }

    console.log(`\n[${new Date().toISOString()}] Mail işlemi tamamlandı!`);
    return {
      success: true,
      processedAt: new Date(),
      usersProcessed: users.length,
    };
  } catch (error) {
    console.error("\n[HATA] Mail worker hatası:", error);
    throw error;
  }
});

console.log("Mail workerı başlatıldı!!!");

mailQueue.on("failed", (job, err) => {
  console.error(`Mail işi başarısız: ${err.message}`);
});

mailQueue.on("completed", (job, result) => {
  console.log(`Mail işi tamamlandı: ${job.id}`, result);
});
