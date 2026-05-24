const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs");
const csv = require("csv-parser");
const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");

let mainWindow;
let client;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  mainWindow.loadFile("index.html");
}

app.whenReady().then(createWindow);

ipcMain.handle("start-client", async () => {
  return new Promise((resolve) => {
    client = new Client({
      authStrategy: new LocalAuth(),
      puppeteer: {
        headless: false,
        executablePath:
          "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", // Chrome path
      },
    });

    client.on("qr", (qr) => mainWindow.webContents.send("qr", qr));
    client.on("authenticated", () =>
      mainWindow.webContents.send("status", "🔑 Authenticated")
    );
    client.on("ready", () => {
      mainWindow.webContents.send("status", "✅ WhatsApp bot is ready!");
      resolve({ ok: true });
    });
    client.on("disconnected", (reason) =>
      mainWindow.webContents.send("status", "❌ Disconnected: " + reason)
    );

    client.initialize();
  });
});

// File picker
ipcMain.handle("pick-file", async (event, type) => {
  const filters =
    type === "csv"
      ? [{ name: "CSV Files", extensions: ["csv"] }]
      : [{ name: "PDF Files", extensions: ["pdf"] }];

  const result = await dialog.showOpenDialog({
    properties: ["openFile"],
    filters,
  });

  if (result.canceled || result.filePaths.length === 0) return null;
  return result.filePaths[0];
});

// Send invitations
ipcMain.handle(
  "send-invitations",
  async (event, { csvPath, pdfPath, message }) => {
    if (!client) return { ok: false, error: "WhatsApp client not initialized" };

    if (!fs.existsSync(pdfPath)) return { ok: false, error: "PDF not found" };
    if (!fs.existsSync(csvPath)) return { ok: false, error: "CSV not found" };

    const media = MessageMedia.fromFilePath(pdfPath);
    const numbers = [];

    return new Promise((resolve) => {
      fs.createReadStream(csvPath)
        .pipe(csv())
        .on("data", (row) => {
          const cleanRow = {};
          for (let key in row) {
            const cleanKey = key
              .replace(/^\uFEFF/, "")
              .trim()
              .toLowerCase();
            cleanRow[cleanKey] = row[key]?.trim();
          }

          let number = cleanRow["number"];
          if (!number) return;

          if (number.length === 10) number = "91" + number; // Add Indian code
          numbers.push(number + "@c.us");
        })
        .on("end", async () => {
          for (let i = 0; i < numbers.length; i++) {
            const number = numbers[i];
            try {
              await client.sendMessage(number, media, { caption: message });
              mainWindow.webContents.send("progress", {
                index: i + 1,
                total: numbers.length,
                number,
                status: "✅ Sent",
              });
            } catch (err) {
              mainWindow.webContents.send("progress", {
                index: i + 1,
                total: numbers.length,
                number,
                status: "❌ Failed",
                error: err.message,
              });
            }
            await new Promise((res) => setTimeout(res, 3000));
          }
          resolve({ ok: true });
        });
    });
  }
);
