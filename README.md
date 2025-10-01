# Argument Visualisation

A web application built with **Next.js 14**, **React**, and **Tailwind CSS** for visualising argumentative structures.  
The project enables users to explore argument relations, predict support/attack links, and visualise debates interactively in 3D.

---

## 🚀 Live Demo
👉 [Visit the deployed app](https://arguments-visualisation.vercel.app)  

---

## 📌 Key Features

### 1. Argument Graph Visualisation
- Display arguments as **nodes** and relations as **links** in a **3D interactive graph**.  
- **Support** and **Attack** relations shown with distinct colors.  
- Root claims are highlighted with a **unique, vivid color** for easy identification.  

### 2. Relation Prediction with AI
- Add a new relation between two textual arguments.  
- Predict whether the second argument **supports** or **attacks** the first using our **trained AI model**. *(Future Kaggle Link)*
- Automatically update the graph with the predicted relation.  
- The AI model is trained on a curated dataset of debates scraped from **Kialo** to capture realistic argumentative structures.

### 3. Sample Debates
- Load predefined **sample CSVs** representing debates around a root claim.  
- Explore debates with interconnected support and attack chains.  

### 4. ABA Generator
- Define literals, assumptions, and rules.  
- Generate arguments and attacks automatically.  
- Handle preferences between assumptions.  

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
- [Next.js 14](https://nextjs.org/)  
- [React](https://react.dev/)  
- [Tailwind CSS](https://tailwindcss.com/)  
- [react-force-graph](https://github.com/vasturiano/react-force-graph) for 3D graph visualisation  
- Deployed with [Vercel](https://vercel.com/)  

---

## 🔧 Getting Started

You have two options: run everything locally or use the deployed version.

### 1️⃣ Run Locally

#### Frontend (Next.js)

Clone the frontend repository and install dependencies:

```bash
git clone https://github.com/edgar-demeude/argument-frontend.git
cd argument-visualisation
npm install
npm run dev
```

Open http://localhost:3000 in your browser.

#### Backend (AI Relation Prediction)

Clone the backend repository and run it with Uvicorn:

```bash
git clone https://github.com/edgar-demeude/argument-backend.git
cd argument-backend
conda env create -f environment.yml
conda activate argument-backend
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

The frontend will use this backend to predict argumentative relations between claims.

### 2️⃣ Use the Deployed Version

Everything is already deployed and running here:
👉 https://arguments-visualisation.vercel.app

## 📖 Usage

Paste an ABA specification into the textarea on the homepage, for example:

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

Click Parse to process the input (parsing logic coming soon).

## 📌 Status

- ✅ Basic skeleton ready
- 🚧 Parsing & reasoning engine to be implemented