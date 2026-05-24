// const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
// const qrcode = require("qrcode-terminal");
// const fs = require("fs");
// const csv = require("csv-parser");

// const client = new Client({
//   authStrategy: new LocalAuth(),
//   puppeteer: {
//     headless: false,
//     executablePath:
//       "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", // ✅ Path to Chrome
//   },
// });

// client.on("qr", (qr) => qrcode.generate(qr, { small: true }));
// client.on("authenticated", () => console.log("🔑 Authenticated"));

// client.on("ready", () => {
//   console.log("✅ WhatsApp bot is ready!");

//   // Check if invitation.pdf exists
//   if (!fs.existsSync("./invitation.pdf")) {
//     console.error("❌ invitation.pdf not found!");
//     return;
//   }
//   // store the pdf into variable
//   const media = MessageMedia.fromFilePath("./invitation.pdf");
//   let numbers = [];

//   // Check if contacts.csv exists
//   if (!fs.existsSync("contacts.csv")) {
//     console.error("❌ contacts.csv not found!");
//     return;
//   }

//   console.log("📂 Reading contacts.csv...");

//   fs.createReadStream("contacts.csv")
//     .pipe(csv())
//     .on("data", (row) => {
//       // Clean header keys (trim, lowercase, remove BOM)
//       const cleanRow = {};
//       for (let key in row) {
//         const cleanKey = key
//           .replace(/^\uFEFF/, "")
//           .trim()
//           .toLowerCase();
//         cleanRow[cleanKey] = row[key]?.trim();
//       }

//       let number = cleanRow["number"];
//       console.log("the number is :", number);

//       if (!number) return;

//       // Add Indian country code if only 10 digits
//       if (number.length === 10) number = "91" + number;

//       numbers.push(number + "@c.us");
//     })
//     .on("end", async () => {
//       console.log(`📤 Sending invitation to ${numbers.length} contacts...`);
//       console.log("Numbers array:", numbers);

//       // Loop through numbers
//       for (let i = 0; i < numbers.length; i++) {
//         const number = numbers[i];
//         if (!number) continue;

//         try {
//           console.log("➡️ Sending to", number);
//           await client.sendMessage(number, media, {
//             caption: "🎉 You are invited! 🙏",
//           });
//           console.log("✅ Sent to", number);
//         } catch (err) {
//           console.error("❌ Failed for", number, err.message);
//         }

//         // wait 3 sec between messages
//         await new Promise((res) => setTimeout(res, 3000));
//       }
//     });
// });

// client.on("disconnected", (reason) => {
//   console.log("❌ Disconnected:", reason);
// });

// client.initialize();

const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const fs = require("fs");
const csv = require("csv-parser");
const path = require("path");

// =========================
// WHATSAPP CLIENT
// =========================
const client = new Client({
  authStrategy: new LocalAuth(),

  puppeteer: {
    headless: false,

    executablePath:
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",

    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--disable-gpu",
    ],
  },
});

// =========================
// QR EVENT
// =========================
client.on("qr", (qr) => {
  console.log("📱 Scan QR Code Below:\n");

  qrcode.generate(qr, {
    small: true,
  });
});

// =========================
// AUTHENTICATED
// =========================
client.on("authenticated", () => {
  console.log("🔑 WhatsApp Authenticated");
});

// =========================
// READY EVENT
// =========================
client.on("ready", () => {
  console.log("✅ WhatsApp Bot Ready!");

  // =========================
  // CHECK CSV EXISTS
  // =========================
  if (!fs.existsSync("./contacts.csv")) {
    console.log("❌ contacts.csv file not found!");
    return;
  }

  // =========================
  // CHECK PDF FOLDER EXISTS
  // =========================
  if (!fs.existsSync("./pdfs")) {
    console.log("❌ pdfs folder not found!");
    return;
  }

  const contacts = [];

  console.log("📂 Reading contacts.csv...\n");

  // =========================
  // READ CSV
  // =========================
  fs.createReadStream("./contacts.csv")
    .pipe(csv())

    .on("data", (row) => {
      // Clean headers
      const cleanRow = {};

      for (let key in row) {
        const cleanKey = key
          .replace(/^\uFEFF/, "")
          .trim()
          .toLowerCase();

        cleanRow[cleanKey] = row[key]?.trim();
      }

      let number = cleanRow["number"];
      const name = cleanRow["name"];
      const pdfIndex = cleanRow["pdf_index"];

      // Skip invalid row
      if (!name || !number || !pdfIndex) {
        console.log("⚠️ Invalid row skipped:", cleanRow);
        return;
      }

      // Add India country code
      if (number.length === 10) {
        number = "91" + number;
      }

      contacts.push({
        name,
        number: number + "@c.us",
        pdfIndex,
      });
    })

    // =========================
    // START SENDING
    // =========================
    .on("end", async () => {
      console.log(`\n📤 Total Contacts: ${contacts.length}\n`);

      for (let i = 0; i < contacts.length; i++) {
        const contact = contacts[i];

        try {
          // =========================
          // PDF PATH
          // Example:
          // pdfs/1.pdf
          // pdfs/2.pdf
          // =========================
          const pdfPath = path.join(
            __dirname,
            "pdfs",
            `${contact.pdfIndex}.pdf`
          );

          // =========================
          // CHECK PDF EXISTS
          // =========================
          if (!fs.existsSync(pdfPath)) {
            console.log(
              `❌ PDF not found for ${contact.name} -> ${contact.pdfIndex}.pdf`
            );
            continue;
          }

          console.log(
            `➡️ Sending to ${contact.name} (${i + 1}/${
              contacts.length
            })`
          );

          // =========================
          // LOAD PDF
          // =========================
          const media = MessageMedia.fromFilePath(pdfPath);

          // =========================
          // CHANGE VISIBLE FILE NAME
          // WhatsApp user will see:
          // Arshil_Invitation.pdf
          // =========================
          media.filename = `${contact.name}_Invitation.pdf`;

          // =========================
          // CUSTOM MESSAGE
          // =========================
          const caption = `🎉 Hello ${contact.name},

You are invited 🙏

Please check your invitation card attached below.`;

          // =========================
          // SEND MESSAGE
          // =========================
          await client.sendMessage(contact.number, media, {
            caption,
          });

          console.log(`✅ Sent to ${contact.name}\n`);
        } catch (err) {
          console.log(`❌ Failed for ${contact.name}`);
          console.log(err.message);
          console.log("");
        }

        // =========================
        // DELAY
        // =========================
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }

      console.log("🎯 All Messages Processed!");
    });
});

// =========================
// DISCONNECTED
// =========================
client.on("disconnected", (reason) => {
  console.log("❌ WhatsApp Disconnected");
  console.log("Reason:", reason);
});

// =========================
// INITIALIZE
// =========================
client.initialize();