// types/express/index.d.ts
import { Etudiant } from '@prisma/client'; // Or your user type

declare global {
  namespace Express {
    interface Request {
      user?: Etudiant; // Replace with your actual user type if different
    }
  }
}

export {};
