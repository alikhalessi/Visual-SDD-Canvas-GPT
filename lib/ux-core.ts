export type JourneyInput = {
  ideaSaved: boolean;
  specificationExists: boolean;
  approvalStatus: 'draft' | 'approved' | null;
  validationIssueCount: number;
};

export type JourneyStep = {
  id: 'idea' | 'specification' | 'approval';
  label: string;
  description: string;
  state: 'complete' | 'current' | 'upcoming';
};

export type NextAction = {
  id: 'idea' | 'specification' | 'approval' | 'planning';
  title: string;
  instruction: string;
};

export function getJourneySteps(input: JourneyInput): JourneyStep[] {
  const validApproval = input.specificationExists && input.approvalStatus === 'approved';
  const idea = input.ideaSaved || input.specificationExists;
  const steps: JourneyStep[] = [
    { id: 'idea', label: 'Capture the idea', description: 'State the problem you want to solve', state: idea ? 'complete' : 'current' },
    { id: 'specification', label: 'Define requirements', description: 'Describe users, outcomes and expected behavior', state: input.specificationExists ? 'complete' : idea ? 'current' : 'upcoming' },
    { id: 'approval', label: 'Review & approve', description: 'Approve only a validated document', state: validApproval ? 'complete' : input.specificationExists ? 'current' : 'upcoming' }
  ];
  return steps;
}

export function getNextAction(input: JourneyInput): NextAction {
  if (!input.ideaSaved && !input.specificationExists) return {
    id: 'idea', title: 'Describe your product idea', instruction: 'Start with a few sentences. You do not need to know programming or SDD.'
  };
  if (!input.specificationExists) return {
    id: 'specification', title: 'Turn your idea into a specification', instruction: 'Open the guided editor and describe what the product should do.'
  };
  if (input.approvalStatus === 'approved') return {
    id: 'planning', title: 'Specification approved', instruction: 'Your revision is approved. Interactive planning and execution are not available in this sprint.'
  };
  return {
    id: 'approval',
    title: input.validationIssueCount > 0 ? 'Complete your requirements' : 'Review the specification',
    instruction: input.validationIssueCount > 0
      ? 'Resolve the remaining validation items in the editor, then review the full document.'
      : 'Your fields pass structural validation. Review the meaning of every requirement before approval.'
  };
}
