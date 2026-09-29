import { z } from "zod";
import { imageContent } from "./common";

export const roomKeys = ["living", "kitchen", "workspace", "kids"] as const;

export const homeSchema = z.strictObject({
  hero: imageContent,
  intro: z.strictObject({ primary: imageContent, secondary: imageContent }),
  filmStrip: z.array(imageContent.extend({ ratio: z.number().positive().max(3) })).min(3),
  lineToLight: z.strictObject({ drawing: imageContent, render: imageContent }),
  rooms: z.array(imageContent.extend({ key: z.enum(roomKeys) })).length(4),
  services: z.strictObject({ design: imageContent, visualize: imageContent, build: imageContent }),
});
export type Home = z.infer<typeof homeSchema>;
