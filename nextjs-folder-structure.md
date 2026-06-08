# Next.js App Router Project Folder Structure

Below is the recommended, production-scale directory layout for the Tutor Management and Student Progress Monitoring application.

```text
├── prisma/
│   └── schema.prisma                # Prisma relational schema layout
├── public/
│   └── icons/                       # Branding visuals & logos
├── src/
│   ├── app/                         # Next.js App Router Pages & API Routes
│   │   ├── layout.tsx               # Root outer HTML skeleton
│   │   ├── page.tsx                 # Public marketing landing page
│   │   ├── admin/                   # Admin pages & user management dashboard
│   │   │   └── page.tsx
│   │   ├── tutor/                   # Tutor portals (Clock in/out, journals)
│   │   │   └── page.tsx
│   │   ├── siswa/                   # View-only student report dashboard
│   │   │   └── page.tsx
│   │   └── api/                     # Server-side restful API handlers
│   │       ├── clock-in/            # Handles tutor check-in
│   │       │   └── route.ts
│   │       └── clock-out/           # Blocked-until-logged clock-out action route
│   │           └── route.ts
│   ├── components/                  # Shared component files styled via Tailwind
│   │   ├── ui/                      # Primitive Shadcn Components (Button, Dialog, Checkbox, etc.)
│   │   │   ├── button.tsx
│   │   │   ├── select.tsx
│   │   │   └── card.tsx
│   │   ├── Sidebar.tsx              # Role-aware navigation drawer
│   │   ├── LearningProgress.tsx     # Student Recharts line graph widget
│   │   ├── SessionJournalForm.tsx   # Interactive session log form
│   │   └── MilestoneKanban.tsx      # Kanban-style drag syllabus milestones
│   ├── db/                          # Database connection instantiation (Prisma Client)
│   │   └── index.ts
│   ├── hooks/                       # Custom utility hooks
│   │   └── useAuth.ts               # Fetches active session role checks
│   ├── lib/                         # Global helpers & configurations
│   │   └── utils.ts                 # Class merger utility (cn)
│   └── types.ts                     # Application level interfaces
├── .env.example                     # Reference server secrets
├── package.json
├── tailwind.config.js
└── tsconfig.json
```
