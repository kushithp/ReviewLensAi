# ReviewLens AI 🔍

ReviewLens AI is a powerful tool designed to help consumers make informed purchasing decisions by summarizing product reviews from popular e-commerce platforms like **Amazon** and **Flipkart**.

## ✨ Features
- **URL Analysis**: Paste a product link from Amazon or Flipkart and get an instant summary.
- **Robust Scraping**: Uses multiple fallback selectors to extract reviews even as site layouts change.
- **Raw Text Analysis**: Paste a block of reviews manually.
- **Aspect Extraction**: Automatically identifies features like "Battery", "Camera", "Price", etc.
- **Sentiment Mapping**: Visualizes pros and cons per aspect.
- **AI Summary**: A concise, human-like summary of the overall sentiment.
- **Export Options**: Copy results as JSON or download the analysis report.
- **Responsive Design**: Works beautifully on mobile and desktop.

## 🛠 Tech Stack
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Motion (Framer Motion).
- **Backend**: Node.js, Express, Cheerio (Scraping), Axios.
- **AI**: Google Gemini 3 Flash via `@google/genai`.
- **Icons**: Lucide React.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A Google Gemini API Key (get it at [aistudio.google.com](https://aistudio.google.com))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/reviewlens-ai.git
   cd reviewlens-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

4. **Run the development server**
   
   To run the unified server (recommended for AI Studio):
   ```bash
   npm run server
   ```
   The app will be available at `http://localhost:3000`.

   To run frontend and backend separately:
   ```bash
   # Terminal 1: Frontend (Port 5173)
   npm run dev
   
   # Terminal 2: Backend (Port 5000)
   npm run server
   ```
   Note: Set `VITE_API_URL=http://localhost:5000/api` in your `.env` for separate mode.

## 📂 Project Structure
```
├── server.ts           # Express backend + Vite middleware
├── backend/
│   └── services/       # Scraping logic
├── src/
│   ├── components/     # Reusable UI components
│   ├── services/       # API service layer
│   ├── types/          # TypeScript interfaces
│   ├── lib/            # Utilities (cn, etc.)
│   └── App.tsx         # Main application logic
├── package.json        # Dependencies and scripts
└── README.md           # You are here
```

## 🧪 Mock Data
If no API key is provided, the app automatically falls back to high-quality mock data so you can still test the UI and flow.

## 📜 License
MIT License. Feel free to use this for your own projects!

---
Built with ❤️ using Google AI Studio.
