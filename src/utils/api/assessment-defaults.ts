
export interface Criterion {
    key: string;
    label: string;
    description: string;
    type: 'number' | 'text' | 'select';
    options?: string[]; // For select type
}

export interface AssessmentCriteria {
    internal: Criterion[];
    external: Criterion[];
}

export function getDefaultAssessmentCriteria(): AssessmentCriteria {
    return {
        internal: [
            { key: 'soft_skill', label: 'Soft Skill', description: 'Communication, teamwork, and leadership', type: 'number' },
            { key: 'hard_skill', label: 'Hard Skill', description: 'Technical ability and quality of work', type: 'number' },
            { key: 'attitude', label: 'Attitude', description: 'Discipline, politeness, and initiative', type: 'number' }
        ],
        external: [
            { key: 'soft_skill', label: 'Work Quality', description: 'Quality and accuracy of assigned tasks', type: 'number' },
            { key: 'hard_skill', label: 'Professionalism', description: 'Conduct and professional behavior', type: 'number' },
            { key: 'attitude', label: 'Integrity', description: 'Honesty and ethical standards', type: 'number' }
        ]
    };
}
