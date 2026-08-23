import { z } from "zod";

export const createBaptismSchema = z.object({
  childFullName: z.string().min(1, "Child full name is required"),
  childGender: z.enum(["Male", "Female"]),
  birthDate: z.string().transform((v) => new Date(v)),
  christianName: z.string().optional(),
  fatherName: z.string().min(1, "Father name is required"),
  motherName: z.string().min(1, "Mother name is required"),
  godfatherName: z.string().optional(),
  godmotherName: z.string().optional(),
  parentPhone: z.string().optional(),
  baptismDate: z.string().transform((v) => new Date(v)),
  childMemberId: z.string().optional(),
});

export const createMarriageSchema = z.object({
  groomName: z.string().min(1, "Groom name is required"),
  brideName: z.string().min(1, "Bride name is required"),
  groomPhone: z.string().optional(),
  bridePhone: z.string().optional(),
  marriageDate: z.string().transform((v) => new Date(v)),
  groomConfessorId: z.string().optional(),
  brideConfessorId: z.string().optional(),
});

export const createBurialSchema = z.object({
  memberId: z.string().min(1, "Member ID is required"),
  deathDate: z.string().transform((v) => new Date(v)),
  burialFeePaid: z.boolean().default(false),
  familyPhone: z.string().optional(),
  notes: z.string().optional(),
});
