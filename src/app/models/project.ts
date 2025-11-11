import {Task} from './task';

export interface Project {
    name: string;
    isEditing: boolean;
    tasks: Task[];
}
