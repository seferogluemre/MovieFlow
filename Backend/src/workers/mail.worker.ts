import prisma from "@config/database";
import mailQueue from "@queues/mail.queue";
import { sendRecommendationEmail } from "@utils/mail/sendMail.util";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

mailQueue.process(async (job) => {
  try {
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

    for (let i = 0; i < users.length; i++) {
      const user = users[i];

      if (user.library.length === 0) {
        continue;
      }

      await sendRecommendationEmail(user.email, user.name!, user.library);

      if (i < users.length - 1) {
        await sleep(2000);
      }
    }

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

mailQueue.on("failed", (job, err) => {
  console.error(`Mail işi başarısız: ${err.message}`);
});

mailQueue.on("completed", (job, result) => {
  console.log(`Mail işi tamamlandı: ${job.id}`, result);
});
