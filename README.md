

# Real Estate Chatbot

A Next.js-based chatbot for real estate projects that answers user queries about available projects using local JSON datasets and the Hugging Face API.

---

## Features

* Conversational chatbot interface for real estate queries
* Search and filter projects based on type, address, and configuration
* Uses local JSON data for projects and configurations
* Integrates Hugging Face API for intelligent responses

---

## Project Structure

```
realestate-chatbot
├─ components
│  ├─ ChatBot.jsx
│  ├─ ChatMessage.jsx
│  └─ ProjectCard.jsx
├─ data
│  ├─ Project.json
│  ├─ ProjectAddress.json
│  ├─ ProjectConfiguration.json
│  └─ ProjectConfigurationVariant.json
├─ pages
│  ├─ index.jsx
│  └─ api
│     └─ chat.js
├─ utils
│  ├─ loadProjects.js
│  └─ formatProjects.js
├─ public
│  └─ (optional images or assets)
├─ package.json
└─ next.config.js
```

---

## Installation

```bash
git clone https://github.com/SharmaSri/realestate-chatbot.git
cd realestate-chatbot
npm install
```

---

## Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

Create a `.env.local` file in the root:

```
HUGGING_FACE_API_KEY=your_hugging_face_api_key
```

---

## Deployment

The project can be deployed on **Render**, **Vercel**, or any Node.js hosting platform:

```bash
npm run build
npm run start
```


---

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature-name`)
3. Commit your changes (`git commit -m 'Add feature'`)
4. Push to the branch (`git push origin feature-name`)
5. Open a pull request

---

## Licens
Do you want me to do that?
