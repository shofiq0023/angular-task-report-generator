export interface Task {
    taskName: string;
    estimatedHour: string | number | null;
    estimatedMinute: string | number | null;
    activeHour: string | number | null;
    activeMinute: string | number | null;
    status: string;
    remarks: string;
}
