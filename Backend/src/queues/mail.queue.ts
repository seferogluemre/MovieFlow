import Queue from "bull";

const mailQueue = new Queue("mail-queue", {
  redis: {
    port: 6379,
    host: "127.0.0.1",
    maxRetriesPerRequest: null,
  },
});

mailQueue.add(
  {},
  {
    repeat: {
      every: 20000,
    },
  }
);

console.log("Mail cron işi başlatıldı! (20 saniyede bir çalışacak)");

export default mailQueue;
