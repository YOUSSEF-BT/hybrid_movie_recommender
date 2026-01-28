# 🎬 Hybrid Movie Recommender

Projet réalisé en binôme par **Youssef BT** et **MohamedAmine Azirgui (maaaz5)**.

Un **système de recommandation de films hybride** (hybrid recommender) qui combine plusieurs signaux (ex. contenu + comportements utilisateurs) pour proposer des films pertinents.

---

## ✨ Objectifs

- Proposer des recommandations personnalisées de films
- Combiner plusieurs approches (hybride) pour améliorer la pertinence
- Fournir une interface (frontend) + une API (backend)

---

## 🧠 Approche (Hybrid Recommender)

Le principe d’un recommender hybride est de **fusionner plusieurs méthodes** (par exemple) :

- **Content-based** : recommandations basées sur les caractéristiques du film (genres, tags, description…)
- **Collaborative filtering** : recommandations basées sur les interactions utilisateurs (notes, historiques…)
- **Hybrid scoring** : combinaison pondérée / re-ranking / fallback (utile pour le cold-start)

> 💡 Astuce : si tu veux un README 100% fidèle à ton implémentation, remplace cette section par les algos exacts utilisés (TF-IDF, embeddings, KNN/SVD, pondérations, etc.).

---

## 🧱 Architecture du projet

hybrid_movie_recommender/
├── backend/ # API + logique de recommandation (Python)
├── frontend/ # Interface utilisateur (TypeScript)
└── data/ # Données (datasets / fichiers de travail)

---

## 🛠️ Tech Stack

- **Backend** : Python (API + algorithmes de recommandation)
- **Frontend** : TypeScript (UI web)
- **Data** : datasets & fichiers nécessaires à l’entraînement / l’inférence

---

## 🚀 Installation

### 1) Cloner le projet

```
git clone https://github.com/YOUSSEF-BT/hybrid_movie_recommender.git
cd hybrid_movie_recommender
```

## 2) Backend (Python)

Selon ton projet, il peut y avoir un requirements.txt ou un pyproject.toml.
```
cd backend
python -m venv .venv

# Linux / macOS
source .venv/bin/activate

# Windows (PowerShell)
# .venv\Scripts\Activate.ps1

pip install -r requirements.txt
```
## 3) Frontend (Node/TypeScript)

```
cd ../frontend
npm install
npm run dev
```
--- 

▶️ Lancer l’application
Backend

Exemples (à adapter selon ton framework) :

FastAPI
```
uvicorn main:app --reload
```

Flask
```
python app.py
```
Frontend
```
npm run dev
```
---

🔌 API (exemple)

À adapter selon tes routes réelles.

GET /health : vérifier que l’API tourne

POST /recommend : obtenir des recommandations (par userId / film / préférences)

Exemple de payload :
```
{
  "user_id": 123,
  "top_k": 10
}
```
---

📊 Données

Le dossier data/ contient les données nécessaires (datasets, exports, etc.).

⚠️ Important : si les fichiers sont lourds, évite de les commit (ou utilise Git LFS) et documente comment les télécharger/générer.

✅ Roadmap (idées)

 Ajouter une évaluation (Precision@K, Recall@K, NDCG, RMSE/MAE)

 Sauvegarder/charger le modèle (pickle/joblib) + cache

 Gérer le cold-start (nouvel utilisateur / nouveau film)

 Dockeriser (backend + frontend)

 Déployer (Render / Railway / Vercel / VPS)

🖼️ Screenshots / Demo

Ajoute ici des captures ou un GIF :

UI (homepage)

Page résultats de recommandations

Exemple d’appel API (Postman)

👥 Auteurs / Contributeurs

Réalisé par :

Youssef BT — GitHub: https://github.com/YOUSSEF-BT

MohamedAmine Azirgui (maaaz5) — GitHub: https://github.com/maaaz5
