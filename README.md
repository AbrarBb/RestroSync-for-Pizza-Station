## Project Overview

- **Project Name**: RestroSync for Pizza Station  
- **Description**: A restaurant management web app that handles pizza orders, menu updates, user accounts, and dashboard analytics for Pizza Station.
- **Live URL**: https://restrosync.lovable.app  
- **Repository**: https://github.com/AbrarBb/RestroSync-for-Pizza-Station

## Tech Stack

| Layer       | Technology                                        |
|-------------|---------------------------------------------------|
| Frontend    | React (TypeScript), Tailwind CSS, shadcn-ui, Vite |
| Backend     | Supabase (PostgreSQL, Auth, Realtime)             |
| Manager     | Bun                                               |
| Hosting     | Lovable (Frontend), Supabase (Backend)            |




**Software Requirement Specification:**
https://docs.google.com/document/d/1qUfPX_OE1OkHJ5yfROkL3wDWTnsqM2C6RpMZ_Xft4eY/edit?usp=sharing


Folder Structure
----------------

`   ├── public/                 # Static files  ├── src/  │   ├── components/         # Reusable UI components  │   ├── pages/              # Page views (Menu, Orders, Auth, etc.)  │   ├── services/           # Supabase functions  │   ├── lib/                # Helpers/utilities  │   ├── hooks/              # Custom React hooks  │   ├── context/            # Auth context  │   └── App.tsx             # App routing and layout  ├── .env                    # Environment variables  ├── bun.lockb               # Bun lockfile  ├── tailwind.config.ts      # Tailwind settings  └── vite.config.ts          # Vite settings   `

Supabase Schema Overview
------------------------

### users Table

*   id: UUID (Primary Key)
    
*   email: TEXT
    
*   role: TEXT (admin, staff)
    

### menu\_items Table

*   id: UUID
    
*   name: TEXT
    
*   description: TEXT
    
*   price: NUMERIC
    
*   available: BOOLEAN
    
*   image\_url: TEXT
    

### orders Table

*   id: UUID
    
*   user\_id: UUID (FK)
    
*   items: JSONB
    
*   status: ENUM(pending, preparing, ready, delivered)
    
*   created\_at: TIMESTAMP
    

Authentication
--------------

*   Uses Supabase Auth (email/password)
    
*   Managed via AuthContext in src/context/AuthContext.tsx
    

`   const session = await supabase.auth.getSession();   `

Realtime Features
-----------------

Orders update in real-time using Supabase subscriptions:

`   codesupabase    .channel('orders')    .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, callback)    .subscribe();   `

UI/UX Details
-------------

*   Tailwind CSS for responsive design
    
*   shadcn/ui for UI components (alerts, buttons, modals)
    
*   Optimized for tablets and smartphones
    

Developer Scripts
-----------------

CommandDescriptionbun run devRun development serverbun run buildCreate production buildbun run previewPreview production build

Deployment (Production)
-----------------------

### Frontend

*   Hosted on Lovable
    
*   Live URL: https://restrosync.lovable.app
    

### Backend

*   Hosted on Supabase
    
*   Uses Supabase Database, Auth, and Realtime
    

Contribution Guide
------------------

1.  Fork the repository
    
2.  Create a new branch: git checkout -b feature/your-feature
    
3.  Make changes and commit: git commit -m "Add feature"
    
4.  Push to GitHub: git push origin feature/your-feature
    
5.  Submit a pull request
    

Documentation Links
-------------------

*   Live App
    
*   SRS Document
    
*   Supabase Docs
    
*   shadcn/ui Docs
    

Future Improvements
-------------------

*   Add unit and integration testing
    
*   Implement role-based UI rendering
    
*   Add receipt printing integration
    
*   Add analytics dashboards
    
*   Enable offline mode using local storage


