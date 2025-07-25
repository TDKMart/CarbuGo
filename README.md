# Gas Station Finder - Application de recherche de stations-service

Une application web moderne pour trouver les stations-service les moins chères en France, avec une interface interactive et des données en temps réel.

## 🚀 Fonctionnalités

### Interface utilisateur
- **Carte interactive** avec clustering intelligent des stations
- **Recherche en temps réel** par nom de station ou ville
- **Géolocalisation** pour trouver les stations proches
- **Interface responsive** optimisée pour mobile et desktop
- **Favoris** pour sauvegarder vos stations préférées
- **Notifications** pour les prix bas

### Données et performance
- **Données officielles** depuis l'API gouvernementale française
- **Cache intelligent** pour des performances optimales
- **Virtualisation** des listes pour gérer de grandes quantités de données
- **Optimisation des requêtes** avec debouncing et mise en cache
- **Mode hors ligne** avec données locales

### Fonctionnalités avancées
- **Clustering de stations** selon le niveau de zoom
- **Filtrage par type de carburant** (Gazole, SP95, SP98, E10, E85, GPL-c)
- **Tri par prix ou distance**
- **Statistiques de prix** en temps réel
- **Intégration Google Maps** pour les itinéraires

## 🛠️ Technologies utilisées

### Frontend
- **React 18** avec TypeScript
- **Tailwind CSS** + **shadcn/ui** pour le design
- **TanStack Query** pour la gestion d'état serveur
- **Leaflet** pour la cartographie
- **Wouter** pour le routage
- **Vite** pour le build

### Backend
- **Node.js** + **Express** avec TypeScript
- **Drizzle ORM** + **PostgreSQL** (Neon Database)
- **API REST** avec validation Zod
- **Cache en mémoire** pour les performances
- **Support XML** pour les données officielles

## 📦 Installation et développement

### Prérequis
- Node.js 18+
- Base de données PostgreSQL (ou utilisation du mode mémoire)

### Installation
```bash
# Cloner le projet
git clone <repository-url>
cd gas-station-finder

# Installer les dépendances
npm install

# Configuration de la base de données (optionnel)
# Créer un fichier .env avec DATABASE_URL
echo "DATABASE_URL=your_postgresql_connection_string" > .env

# Appliquer les migrations (si base de données)
npm run db:push
```

### Développement
```bash
# Démarrer le serveur de développement
npm run dev

# Le serveur sera accessible sur http://localhost:5000
```

### Build et production
```bash
# Build de production
npm run build

# Démarrer en production
npm run start
```

## 🏗️ Architecture

### Structure du projet
```
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/    # Composants UI
│   │   ├── hooks/         # Hooks personnalisés
│   │   ├── lib/           # Utilitaires et configuration
│   │   └── pages/         # Pages de l'application
├── server/                # Backend Express
│   ├── routes.ts          # Routes API
│   ├── storage.ts         # Couche d'accès aux données
│   └── xml-loader.ts      # Chargement des données XML
├── shared/                # Types et schémas partagés
└── migrations/            # Migrations de base de données
```

### Optimisations implémentées

#### Performance
- **Virtualisation des listes** pour gérer des milliers de stations
- **Debouncing** des recherches et événements de carte
- **Cache multi-niveaux** (mémoire serveur + client)
- **Lazy loading** des stations selon la zone visible
- **Clustering intelligent** des marqueurs de carte

#### UX/UI
- **Interface responsive** avec design mobile-first
- **Feedback visuel** pour tous les états de chargement
- **Gestion d'erreur** robuste avec messages utilisateur
- **Géolocalisation** avec fallback gracieux
- **Mode hors ligne** avec données locales

#### Code
- **TypeScript strict** pour la sécurité des types
- **Hooks personnalisés** pour la réutilisabilité
- **Séparation des responsabilités** claire
- **Gestion d'état optimisée** avec TanStack Query
- **Utilitaires centralisés** pour la cohérence

## 🔧 Configuration

### Variables d'environnement
```bash
# Base de données (optionnel - utilise la mémoire par défaut)
DATABASE_URL=postgresql://user:password@host:port/database

# Environnement
NODE_ENV=development|production

# Port (par défaut: 5000)
PORT=5000
```

### Personnalisation
- **Seuils de prix** dans `client/src/lib/constants.ts`
- **Configuration de carte** (centre, zoom, etc.)
- **Délais de cache** et debouncing
- **Thèmes et couleurs** via Tailwind CSS

## 📱 Compatibilité

- **Navigateurs modernes** (Chrome, Firefox, Safari, Edge)
- **Appareils mobiles** iOS et Android
- **Progressive Web App** ready
- **Accessibilité** WCAG 2.1 AA

## 🤝 Contribution

Les contributions sont les bienvenues ! Merci de :
1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🙏 Remerciements

- **Gouvernement français** pour les données ouvertes des stations-service
- **OpenStreetMap** pour les cartes
- **Communauté open source** pour les outils et bibliothèques utilisés