
# 📲 Whatsapp_automation_message

A Node.js–based WhatsApp automation system that allows sending **bulk personalized messages and PDF documents** using a CSV file.
Built with **whatsapp-web.js** and **Express.js** for learning and small-scale automation use.

---

## 🚀 Features

* QR-based WhatsApp Web authentication
* Bulk message sending using CSV
* Message personalization with placeholders
* Send PDF files as documents
* Configurable delay between messages
* Stop bulk sending anytime
* Message history logging

---

## 🛠️ Tech Stack

* Node.js
* Express.js
* whatsapp-web.js
* Puppeteer
* Multer
* CSV Parser

---

## 📥 Installation

### 1. Clone the project

```bash
git clone <your-repository-url>
cd Whatsapp-Portal
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the server

```bash
node server.js
```

### 4. Scan QR Code

Scan the QR code from WhatsApp mobile app to authenticate.

---

## 📂 How It Works

1. Start the server
2. Authenticate WhatsApp via QR
3. Upload CSV file
4. Enter message template
5. (Optional) Upload PDF file
6. Messages are sent with delay
7. Logs are saved automatically

---

## 📑 CSV File Format

```csv
Name,date1,date2,Mobile No
Abc,sajode,sajode,9876543210
xyz,sarvo,sarvo,9123456789
```

### Notes:

* Header row is ignored
* Country code `91` is auto-added if missing
* Numbers must be valid

---

## ✨ Message Personalization

Supported placeholders:

| Placeholder | Meaning      |
| ----------- | ------------ |
| `{name}`    | Contact name |
| `{date}`    | Fixed date   |
| `{sajode}`   | CSV value    |
| `{sarvo}`   | CSV value    |

Example:

```
Hello {name}, your event is on {date}.
```

---

## 📎 PDF Sending

* PDF is sent as a document
* Same PDF is shared with all contacts
* Caption is personalized

---

## 🛑 Stop Sending

Bulk sending can be stopped anytime using the stop endpoint.

---

## 🧾 Logs

* All message activity is stored in `history.json`
* Includes date, name, number, and status

---

## ⚠️ Disclaimer

This project uses **WhatsApp Web automation**, not the official WhatsApp API.
Excessive usage may result in account restrictions.
Use responsibly for educational or internal purposes only.

---

## 🚧 Limitations

* Depends on WhatsApp Web
* Requires Google Chrome
* Not production-ready for large scale
* WhatsApp updates may break functionality

---


* LICENSE.md
* Project report (college format)
* API documentation

Just tell me 👌
