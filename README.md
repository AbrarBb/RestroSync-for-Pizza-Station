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



## Folder Structure

```text
RestroSync-for-Pizza-Station/
├── public/                 # Static assets like icons, images
├── src/                    # Source code
│   ├── components/         # Reusable UI components
│   ├── pages/              # Main views (Menu, Orders, Dashboard, etc.)
│   ├── services/           # Supabase API interactions
│   ├── lib/                # Utility functions and helpers
│   ├── hooks/              # Custom React hooks
│   ├── context/            # Global contexts (e.g., AuthContext)
│   ├── App.tsx             # App entry and route definitions
│   └── main.tsx            # Main app rendering
├── .env                    # Environment variables (not committed)
├── index.html              # Root HTML file
├── tailwind.config.ts      # Tailwind CSS configuration
├── vite.config.ts          # Vite development configuration
├── tsconfig.json           # TypeScript configuration
├── bun.lockb               # Bun package lock file
└── README.md               # Project documentation
```

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
    

## Documentation Links

- [Live App](https://restrosync.lovable.app)  
  Access the deployed RestroSync application for Pizza Station.

- [Software Requirements Specification (SRS) Document](https://docs.google.com/document/d/1qUfPX_OE1OkHJ5yfROkL3wDWTnsqM2C6RpMZ_Xft4eY/edit?usp=sharing)  
  Comprehensive documentation of project scope, features, and requirements.

- [Supabase Documentation](https://supabase.com/docs)  
  Learn more about the backend services used, including Auth, Database, and Realtime.

- [shadcn/ui Documentation](https://ui.shadcn.dev)  
  Reference for UI components used throughout the application.

    

Future Improvements
-------------------

*   Add unit and integration testing
    
*   Implement role-based UI rendering
    
*   Add receipt printing integration
    
*   Add analytics dashboards
    
*   Enable offline mode using local storage


