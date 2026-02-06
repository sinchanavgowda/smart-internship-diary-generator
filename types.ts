
export interface DiaryEntry {
  id: string;
  date: string;
  brief: string;
  generatedContent: string;
  learningOutcomes: string;
  tags: string[];
}

export interface UserProfile {
  name: string;
  usn: string;
  company: string;
  internshipTitle: string;
}

export enum GenerationTone {
  PROFESSIONAL = 'Professional',
  TECHNICAL = 'Technical',
  ACADEMIC = 'Academic'
}
