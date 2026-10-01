import type { Question, QuestionInput } from "./authoring.types";
export interface QuestionFormProps {
  question?: Question;
  isPublished: boolean;
  isPending: boolean;
  onSubmit: (input: QuestionInput) => Promise<void>;
  formId?: string;
  hideSubmitButton?: boolean;
}
