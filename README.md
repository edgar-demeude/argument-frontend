# Argument Visualisation

A web application built with **Next.js 14**, **React**, and **Tailwind CSS** for visualising argumentative structures.  
Users can visualise argument relations interactively in 3D, predict support/attack links, and generate ABA+ frameworks interactively.

---

## 🚀 Live Demo
👉 [Visit the deployed app](https://arguments-visualisation.vercel.app)  

---

## 📌 Key Features

### 1. Argument Graph Visualisation
- Display arguments as **nodes** and relations as **links** in a **fully interactive 3D graph**.  
- **Support** and **Attack** relations shown with distinct colors.  
- Root claims are highlighted with a **unique, vivid color** for easy identification. 
- Auto-zoom and dynamic resizing to fit the graph to screen. 

### 2. Relation Prediction with AI
- Add a new relation between two textual arguments.  
- Predict whether the second argument **supports** or **attacks** the first using our **trained AI model**. *(Future Kaggle Link)*
- Automatically update the graph with the predicted relation.  
- The AI model is trained on a curated dataset of debates scraped from **Kialo** to capture realistic argumentative structures.

### ABA+ Framework Generator

- Upload a text file or use predefined examples to build ABA+ frameworks.
- Automatically generates **assumptions**, **arguments**, **attacks**, and **reverse attacks**.
- Supports preferences between assumptions.
- Graph visualization reflects the ABA+ structure in real time.

### 4. Sample Debates & Examples
- Preloaded **CSV examples** demonstrate typical debate structures.
- Users can explore **interconnected support** and **attack chains**.
- Quick **preview of ABA+** output directly in the interface.
- Future plans to allow users to upload **their own CSV files** for custom debates.

---

## 📂 Project Structure

### Argument Visualisation (Graph)
- `src/app/relations/page.tsx` → Main argument visualisation page  
- `src/app/relations/components/Graph3D.tsx` → 3D graph component with zoom and node highlighting  
- `src/app/relations/components/GraphPanel.tsx` → Controls panel for adding relations, loading samples, and viewing node details  
- `src/app/relations/sampleCSV.ts` → Sample debate CSVs and parsing utilities  
- `src/app/relations/types.ts` → Type definitions for graph nodes and links  

### ABA Generator (legacy)
- `src/app/aba/page.tsx` → ABA generator page (literals, assumptions, rules, argument/attack generation)

---

## 🛠️ Tech Stack
- **Frontend:** Next.js 14, React, Tailwind CSS
- **3D Visualization:** react-force-graph
- **Backend:** FastAPI, PyTorch ML models
- **ABA Framework:** Custom ABA+ generator for assumptions and attacks
- **Deployment:** Vercel (frontend), Hugging Face or local backend

---

## 🔧 Getting Started

You can either run everything locally or use the deployed app.

### 1️⃣ Run Locally

### Frontend (Next.js)

Clone the frontend repository and install dependencies:

```bash
git clone https://github.com/edgar-demeude/argument-frontend.git
cd argument-visualisation
nvm install --lts
nvm use --lts
npm install
npm run dev
```

Open http://localhost:3000 in your browser.

### Backend

Clone the backend repository and run it with Uvicorn:

```bash
git clone https://github.com/edgar-demeude/argument-backend.git
cd argument-backend
conda env create -f environment.yml
conda activate argument-backend
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

The frontend will connect to the backend to predict relations and generate ABA+ graphs.

### 2️⃣ Use the Deployed Version

Everything is already deployed and running here:
👉 https://arguments-visualisation.vercel.app

## 📖 Example ABA+ Input

```bash
L: [a,b,c,q,p,r,s,t]
A: [a,b,c]
C(a): r
C(b): s
C(c): t
[r1]: p <- q,a
[r2]: q <-
[r3]: r <- b,c
[r4]: t <- p,c
[r5]: s <- t
PREF: a > b
```

- Upload or select an example file to generate arguments, attacks, and reverse attacks.
- Results are displayed in both textual ABA+ form and 3D graph.

## 📌 Status

- ✅ Interactive 3D argument visualization
- ✅ AI relation prediction (support/attack)
- ✅ ABA+ generator with assumptions, arguments, and attacks