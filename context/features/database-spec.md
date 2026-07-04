## Overview
Set up a Prisma ORM with neon postgres database for the Employee Attendance System.

## Requirements
- Use Prisma ORM for database operations.
- Use neon postgres database for database storage.
- Use Prisma schema for database schema definition.
- Use Prisma seed for database seed data.
- Use Prisma migration for database migration.
- Use Prisma client for database client.
- Create initi8al schema based on data mo0dels in mockdata.ts
- Include Nextauth models for authentication.
- Add appropriate indexes for cascade delete operations  and performance.
- 
  

## Refrences

-Initial data models from mockdata.ts
- Nextauth models for authentication.
- `@context/project-overview.md` for project overview.
- Prsima docs : https://prisma.io/docs (Prisma 7 has a braking changes -fetch the latest )
- Look at the setup guide at https://prisma.io/docs/getting-started/prisma-orm/quickstart/prisma-postgres
  
  
## Notes

We will have a development branch that we work on that will be in DATABASE_URL and then we will have a production branch. So we ALWAYS create migrations and never push directly unless specified.

IMPORTANT! Use Prisma 7, which has some breaking changes. Read the entire upgrade guide at https://www.prisma.io/docs/orm/more/upgrade-guides/upgrading-versions/upgrading-to-prisma-7 to get a good idea of the changes.

You can also look at the setup guide here - https://www.prisma.io/docs/getting-started/prisma-orm/quickstart/prisma-postgres