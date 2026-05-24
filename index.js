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
//   //   if (!fs.existsSync("./invitation.pdf")) {
//   //     console.error("❌ invitation.pdf not found!");
//   //     return;
//   //   }
//   // store the pdf into variable
//   //   const media = MessageMedia.fromFilePath("./invitation.pdf");
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
//           await client.sendMessage(
//             number,
//             "૦૫/૧૨/૨૦૨૫ ના રોજ બપોર ૧:૩૦ કલાકે મંડપ મુહૃત માં ટાઇમસર પહોંચવા વિનંતી"
//           );
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

const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const fs = require("fs");
const csv = require("csv-parser");

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: false,
    executablePath:
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  },
});

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("authenticated", () => {
  console.log("🔑 Authenticated");
});

client.on("ready", () => {
  console.log("✅ WhatsApp bot is ready!");

  let contacts = [];

  if (!fs.existsSync("contacts.csv")) {
    console.error("❌ contacts.csv not found!");
    return;
  }

  console.log("📂 Reading contacts.csv...");

  fs.createReadStream("contacts.csv")
    .pipe(csv())
    .on("data", (row) => {
      // Clean CSV keys
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
      const type1 = cleanRow["type1"];
      const date1 = cleanRow["date1"];
      const type2 = cleanRow["type2"];
      const date2 = cleanRow["date2"];

      if (!number || !name) return;

      // Add India country code
      if (number.length === 10) {
        number = "91" + number;
      }

      contacts.push({
        number: number + "@c.us",
        name,
        type1,
        date1,
        type2,
        date2,
      });
    })
    .on("end", async () => {
      console.log(`📤 Sending messages to ${contacts.length} contacts...`);

      for (let i = 0; i < contacts.length; i++) {
        const contact = contacts[i];

        try {
          // Dynamic message
          const message = `
Dear ${contact.name},

I want to invite you ${contact.type1} to our family function.
for the date ${contact.date1} and  ${contact.type2} with this date  ${contact.date2}

Please come on time 🙏
`;

          console.log("➡️ Sending to", contact.number);

          await client.sendMessage(contact.number, message);

          console.log("✅ Sent to", contact.name);
        } catch (err) {
          console.error(
            "❌ Failed for",
            contact.number,
            err.message
          );
        }

        // Wait 3 seconds
        await new Promise((res) => setTimeout(res, 3000));
      }

      console.log("🎉 All messages processed!");
    });
});

client.on("disconnected", (reason) => {
  console.log("❌ Disconnected:", reason);
});

client.initialize();