import {Component} from '@angular/core';
import {faMinus, faPlus} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {Project} from './models/project';
import {Task} from './models/task';

@Component({
    selector: 'app-root',
    imports: [FontAwesomeModule],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})
export class AppComponent {
    // FontAwesome icon definition
    public addIcon = faPlus;
    public minusIcon = faMinus;

    // Data
    public projects: Project[] = [];

    // Constructor
    ngOnInit() {
        this.addEmptyProject();
    }


    // Functions
    public addEmptyProject(): void {
        let task: Task = {
            taskName: '',
            estimatedTime: '',
            activeTime: '',
            status: '',
            remarks: ''
        };
        let project : Project = {
            name: '',
            tasks: [task]
        };
        this.projects.push(project);
    }

    public addEmptyTask(index: number): void {
        let task: Task = {
            taskName: '',
            estimatedTime: '',
            activeTime: '',
            status: '',
            remarks: ''
        };
        this.projects[index].tasks.push(task);
    }

    public removeProject(index: number): void {
        if (confirm('Are you sure you want to remove this project?')) {
            this.projects.splice(index, 1);
        }
    }

    public removeTask(projectIndex: number, taskIndex: number): void {
        if (confirm('Are you sure you want to remove this task?')) {
            this.projects[projectIndex].tasks.splice(taskIndex, 1);
        }
    }
}
