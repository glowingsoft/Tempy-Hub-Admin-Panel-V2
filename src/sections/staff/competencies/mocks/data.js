import dayjs from 'dayjs';

export const competencyStatusOptions = [
    { value: 'current', label: 'Current', color: 'success' },
    { value: 'dueSoon', label: 'Due Soon', color: 'warning' },
    { value: 'overdue', label: 'Overdue', color: 'error' },
];

export const staffCompetencies = [
    {
        _id: 'staff-competency-001',
        title: 'Fire Safety',
        providerAssessor: 'SafeWork Training Ltd',
        completedDate: '2026-05-12T00:00:00.000Z',
        nextDueDate: '2026-11-12T00:00:00.000Z',
        supportingEvidence: null,
    },
    {
        _id: 'staff-competency-002',
        title: 'Moving and Handling',
        providerAssessor: 'Internal Training Team',
        completedDate: '2025-09-18T00:00:00.000Z',
        nextDueDate: '2026-09-18T00:00:00.000Z',
        supportingEvidence: null,
    },
    {
        _id: 'staff-competency-003',
        title: 'Safeguarding Adults',
        providerAssessor: 'Care Skills Academy',
        completedDate: '2026-02-03T00:00:00.000Z',
        nextDueDate: '2027-02-03T00:00:00.000Z',
        supportingEvidence: null,
    },
];

export function getCompetencyStatus(competency, today = dayjs()) {
    const dueDate = dayjs(competency.nextDueDate);
    if (dueDate.isBefore(today, 'day')) return 'overdue';
    if (dueDate.diff(today, 'day') <= 30) return 'dueSoon';
    return 'current';
}

export function getCompetencyStatusMeta(status) {
    return competencyStatusOptions.find((option) => option.value === status) || competencyStatusOptions[0];
}
