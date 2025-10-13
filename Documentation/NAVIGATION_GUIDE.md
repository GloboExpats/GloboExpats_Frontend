# Documentation Navigation Guide

## 🎯 Quick Navigation

### I want to...

#### **Understand the Platform**
→ Start here: [`architecture/PLATFORM_SUMMARY.md`](architecture/PLATFORM_SUMMARY.md)  
→ Deep dive: [`architecture/PLATFORM_ANALYSIS.md`](architecture/PLATFORM_ANALYSIS.md)  
→ Frontend overview: [`architecture/frontend-overview.md`](architecture/frontend-overview.md)

#### **Set Up Development Environment**
→ Environment setup: [`development/environment-setup.md`](development/environment-setup.md)  
→ Root `.env.example` for configuration  
→ Main `README.md` for getting started

#### **Deploy the Application**
→ Deployment guide: [`deployment/DEPLOYMENT.md`](deployment/DEPLOYMENT.md)  
→ Docker configuration: Root `Dockerfile`  
→ Deployment scripts: Root `docker-deploy.sh`

#### **Integrate with Backend API**
→ API requirements: [`api/api-requirements.md`](api/api-requirements.md)  
→ Backend integration: [`api/backend.md`](api/backend.md)  
→ Database schema: [`api/database-schema.md`](api/database-schema.md)

#### **Work with Components**
→ Component guide: [`guides/COMPONENTS_GUIDE.md`](guides/COMPONENTS_GUIDE.md)  
→ Component connections: [`architecture/COMPONENT_CONNECTIONS.md`](architecture/COMPONENT_CONNECTIONS.md)  
→ React patterns: [`architecture/REACT_TYPESCRIPT_GUIDE.md`](architecture/REACT_TYPESCRIPT_GUIDE.md)

#### **Implement a Feature**
→ Cart system: [`features/CART_IMPLEMENTATION.md`](features/CART_IMPLEMENTATION.md)  
→ OAuth: [`features/GOOGLE_OAUTH_IMPLEMENTATION.md`](features/GOOGLE_OAUTH_IMPLEMENTATION.md)  
→ Feature docs: [`features/`](features/)

#### **Optimize Performance**
→ Performance guide: [`guides/PERFORMANCE_GUIDE.md`](guides/PERFORMANCE_GUIDE.md)  
→ Optimization summary: [`development/OPTIMIZATION_SUMMARY.md`](development/OPTIMIZATION_SUMMARY.md)

#### **Ensure Accessibility**
→ Accessibility guide: [`guides/ACCESSIBILITY.md`](guides/ACCESSIBILITY.md)

#### **Fix Bugs**
→ Recent fixes: [`bugfixes/BUGFIX_SUMMARY.md`](bugfixes/BUGFIX_SUMMARY.md)  
→ Testing checklist: [`bugfixes/VERIFICATION_CHECKLIST.md`](bugfixes/VERIFICATION_CHECKLIST.md)

#### **Plan Improvements**
→ Restructuring plan: [`development/RESTRUCTURING_PLAN.md`](development/RESTRUCTURING_PLAN.md)  
→ Implementation summary: [`development/IMPLEMENTATION_SUMMARY.md`](development/IMPLEMENTATION_SUMMARY.md)

---

## 📚 By Category

### 🏗️ Architecture (9 docs)
System design, technical architecture, and codebase structure.

| Document | Description |
|----------|-------------|
| [PLATFORM_SUMMARY.md](architecture/PLATFORM_SUMMARY.md) | Executive summary of the platform |
| [PLATFORM_ANALYSIS.md](architecture/PLATFORM_ANALYSIS.md) | Comprehensive platform analysis |
| [COMPONENT_CONNECTIONS.md](architecture/COMPONENT_CONNECTIONS.md) | How components interact |
| [REACT_TYPESCRIPT_GUIDE.md](architecture/REACT_TYPESCRIPT_GUIDE.md) | React & TypeScript patterns |
| [frontend-overview.md](architecture/frontend-overview.md) | Frontend architecture overview |
| [frontend-codebase-audit.md](architecture/frontend-codebase-audit.md) | Code audit results |
| [PRD_PART1_OVERVIEW_ARCHITECTURE.md](architecture/PRD_PART1_OVERVIEW_ARCHITECTURE.md) | Product requirements (Part 1) |
| [PRD_PART2_DATABASE_API.md](architecture/PRD_PART2_DATABASE_API.md) | Product requirements (Part 2) |
| [PRD_PART3_IMPLEMENTATION_ROADMAP.md](architecture/PRD_PART3_IMPLEMENTATION_ROADMAP.md) | Product requirements (Part 3) |

### ✨ Features (3 docs)
Feature-specific documentation and implementation guides.

| Document | Description |
|----------|-------------|
| [CART_IMPLEMENTATION.md](features/CART_IMPLEMENTATION.md) | Shopping cart system implementation |
| [CART_IMPLEMENTATION_SUMMARY.md](features/CART_IMPLEMENTATION_SUMMARY.md) | Cart implementation summary |
| [GOOGLE_OAUTH_IMPLEMENTATION.md](features/GOOGLE_OAUTH_IMPLEMENTATION.md) | OAuth integration guide |

### 🔌 API (4 docs)
API integration, endpoints, and backend communication.

| Document | Description |
|----------|-------------|
| [api-requirements.md](api/api-requirements.md) | API requirements and endpoints |
| [backend.md](api/backend.md) | Backend integration guide |
| [database-mongodb.md](api/database-mongodb.md) | MongoDB database setup |
| [database-schema.md](api/database-schema.md) | Database schema documentation |

### 🚀 Deployment (1 doc)
Deployment guides, Docker configuration, and environment setup.

| Document | Description |
|----------|-------------|
| [DEPLOYMENT.md](deployment/DEPLOYMENT.md) | Comprehensive deployment guide |

### 💻 Development (6 docs)
Development guides, coding standards, and improvement plans.

| Document | Description |
|----------|-------------|
| [RESTRUCTURING_PLAN.md](development/RESTRUCTURING_PLAN.md) | Platform improvement roadmap |
| [IMPLEMENTATION_SUMMARY.md](development/IMPLEMENTATION_SUMMARY.md) | Implementation summary |
| [OPTIMIZATION_SUMMARY.md](development/OPTIMIZATION_SUMMARY.md) | Optimization efforts |
| [REFACTORING_SUMMARY.md](development/REFACTORING_SUMMARY.md) | Refactoring summary |
| [frontend-cleanup-summary.md](development/frontend-cleanup-summary.md) | Cleanup summary |
| [environment-setup.md](development/environment-setup.md) | Environment setup guide |

### 📖 Guides (3 docs)
User guides, best practices, and how-to documentation.

| Document | Description |
|----------|-------------|
| [COMPONENTS_GUIDE.md](guides/COMPONENTS_GUIDE.md) | Component library guide |
| [PERFORMANCE_GUIDE.md](guides/PERFORMANCE_GUIDE.md) | Performance optimization |
| [ACCESSIBILITY.md](guides/ACCESSIBILITY.md) | Accessibility guidelines |

### 🐛 Bug Fixes (2 docs)
Bug fix documentation and verification checklists.

| Document | Description |
|----------|-------------|
| [BUGFIX_SUMMARY.md](bugfixes/BUGFIX_SUMMARY.md) | Recent bug fixes |
| [VERIFICATION_CHECKLIST.md](bugfixes/VERIFICATION_CHECKLIST.md) | Testing checklist |

---

## 👥 By Role

### Frontend Developer
**Start Here**: [`architecture/PLATFORM_SUMMARY.md`](architecture/PLATFORM_SUMMARY.md)

**Essential Docs**:
1. [`architecture/frontend-overview.md`](architecture/frontend-overview.md) - Architecture
2. [`guides/COMPONENTS_GUIDE.md`](guides/COMPONENTS_GUIDE.md) - Components
3. [`architecture/REACT_TYPESCRIPT_GUIDE.md`](architecture/REACT_TYPESCRIPT_GUIDE.md) - Patterns
4. [`guides/PERFORMANCE_GUIDE.md`](guides/PERFORMANCE_GUIDE.md) - Performance
5. [`guides/ACCESSIBILITY.md`](guides/ACCESSIBILITY.md) - Accessibility

**Feature Implementation**:
- [`features/CART_IMPLEMENTATION.md`](features/CART_IMPLEMENTATION.md)
- [`features/GOOGLE_OAUTH_IMPLEMENTATION.md`](features/GOOGLE_OAUTH_IMPLEMENTATION.md)

### Backend Developer
**Start Here**: [`api/api-requirements.md`](api/api-requirements.md)

**Essential Docs**:
1. [`api/backend.md`](api/backend.md) - Integration guide
2. [`api/database-schema.md`](api/database-schema.md) - Data models
3. [`api/database-mongodb.md`](api/database-mongodb.md) - MongoDB setup
4. [`architecture/PLATFORM_SUMMARY.md`](architecture/PLATFORM_SUMMARY.md) - Overview

### DevOps Engineer
**Start Here**: [`deployment/DEPLOYMENT.md`](deployment/DEPLOYMENT.md)

**Essential Docs**:
1. [`development/environment-setup.md`](development/environment-setup.md) - Environment
2. Root `Dockerfile` - Container configuration
3. Root `.env.example` - Environment variables
4. Root `docker-deploy.sh` - Deployment script

### QA Engineer
**Start Here**: [`bugfixes/VERIFICATION_CHECKLIST.md`](bugfixes/VERIFICATION_CHECKLIST.md)

**Essential Docs**:
1. [`bugfixes/BUGFIX_SUMMARY.md`](bugfixes/BUGFIX_SUMMARY.md) - Recent fixes
2. [`guides/ACCESSIBILITY.md`](guides/ACCESSIBILITY.md) - Accessibility testing
3. [`guides/PERFORMANCE_GUIDE.md`](guides/PERFORMANCE_GUIDE.md) - Performance testing

### Product Manager
**Start Here**: [`architecture/PLATFORM_SUMMARY.md`](architecture/PLATFORM_SUMMARY.md)

**Essential Docs**:
1. [`architecture/PRD_PART1_OVERVIEW_ARCHITECTURE.md`](architecture/PRD_PART1_OVERVIEW_ARCHITECTURE.md) - PRD Part 1
2. [`architecture/PRD_PART2_DATABASE_API.md`](architecture/PRD_PART2_DATABASE_API.md) - PRD Part 2
3. [`architecture/PRD_PART3_IMPLEMENTATION_ROADMAP.md`](architecture/PRD_PART3_IMPLEMENTATION_ROADMAP.md) - PRD Part 3
4. [`development/RESTRUCTURING_PLAN.md`](development/RESTRUCTURING_PLAN.md) - Roadmap
5. [`features/`](features/) - Feature documentation

### New Team Member
**Start Here**: Main `README.md` (in root)

**Onboarding Path**:
1. Main `README.md` - Project overview
2. [`architecture/PLATFORM_SUMMARY.md`](architecture/PLATFORM_SUMMARY.md) - Platform overview
3. [`development/environment-setup.md`](development/environment-setup.md) - Setup
4. [`architecture/frontend-overview.md`](architecture/frontend-overview.md) - Architecture
5. [`guides/COMPONENTS_GUIDE.md`](guides/COMPONENTS_GUIDE.md) - Components
6. Role-specific docs from above

---

## 🔍 Search Tips

### By Keyword
- **Authentication**: Check `features/` and `api/`
- **Cart**: See `features/CART_IMPLEMENTATION.md`
- **Components**: See `guides/COMPONENTS_GUIDE.md`
- **Database**: Check `api/database-*.md`
- **Deployment**: See `deployment/DEPLOYMENT.md`
- **Performance**: See `guides/PERFORMANCE_GUIDE.md`
- **Testing**: Check `bugfixes/`

### By File Type
- **Guides**: `guides/` folder
- **API Specs**: `api/` folder
- **Architecture**: `architecture/` folder
- **Features**: `features/` folder
- **Bug Fixes**: `bugfixes/` folder

---

## 📝 Documentation Standards

### File Naming
- **UPPERCASE.md** - Major documentation (e.g., PLATFORM_SUMMARY.md)
- **lowercase-with-hyphens.md** - Specific docs (e.g., api-requirements.md)

### Structure
All documentation should include:
1. Clear title and description
2. Table of contents (for long docs)
3. Code examples where applicable
4. Links to related documentation
5. Last updated date

### Contributing
When adding documentation:
1. Place in appropriate category folder
2. Update [`README.md`](README.md) index
3. Update this navigation guide
4. Follow naming conventions
5. Include examples and diagrams

---

## 🆘 Can't Find What You Need?

1. **Check the main index**: [`README.md`](README.md)
2. **Search by role**: See "By Role" section above
3. **Search by topic**: See "By Category" section above
4. **Check related docs**: Most docs link to related content
5. **Ask the team**: Contact development team

---

**Last Updated**: 2025-10-13  
**Maintained By**: Expat Marketplace Team
