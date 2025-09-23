# ABA Generator

A minimal web application built with **Next.js** and deployed on **Vercel**.  
The project aims to implement an **Assumption-Based Argumentation (ABA) generator** with the following capabilities:

- Definition of literals, rules, and assumptions  
- Definition of contraries for assumptions  
- Automatic conversion to non-circular and atomic ABA frameworks  
- Generation of all arguments and attacks  
- Handling of preferences between assumptions  
- Computation of normal and reverse attacks  

---

## 🚀 Live Demo
👉 [Visit the deployed app](https://your-vercel-url.vercel.app)  

---

## 📂 Project Structure
- `app/page.tsx` → Home page with a text input (skeleton for ABA data).  
- Future components will handle parsing, framework generation, and visualization.  

---

## 🛠️ Tech Stack
- [Next.js 14](https://nextjs.org/)  
- [React](https://react.dev/)  
- [Tailwind CSS](https://tailwindcss.com/)  
- Deployed with [Vercel](https://vercel.com/)  

---

## 🔧 Getting Started

Clone the repository and install dependencies:

```bash
git clone https://github.com/<your-username>/aba-generator.git
cd aba-generator
npm install
npm run dev
```

Then open http://localhost:3000.

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