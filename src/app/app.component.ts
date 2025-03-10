import {Component} from '@angular/core';
import {faBroom, faEye, faFloppyDisk, faMinus, faPlus, faTrash} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {Project} from './models/project';
import {Task} from './models/task';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {PreviewModalComponent} from './components/modal/preview-modal/preview-modal.component';
import {FormsModule} from '@angular/forms';
import {LocalStorageService} from './services/local-storage.service';
import {DatePipe} from '@angular/common';

@Component({
    selector: 'app-root',
    imports: [FontAwesomeModule, FormsModule, DatePipe],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})
export class AppComponent {
    // Const
    private PROJECT_KEY: string = 'projects';
    private USERNAME_KEY: string = 'username';

    // FontAwesome icon definition
    public addIcon = faPlus;
    public minusIcon = faMinus;
    public saveIcon = faFloppyDisk;
    public clearIcon = faBroom;
    public deleteIcon = faTrash;
    public viewIcon = faEye;

    // Data
    public username: string = '';
    public projects: Project[] = [];

    // Initializer
    ngOnInit() {
        this.getUsernameFromStorage();
        this.getProjects();
    }

    // Constructor
    public constructor(private modal: NgbModal, private storageService: LocalStorageService) {
    }


    // Functions
    public addEmptyProject(): void {
        let task: Task = {
            taskName: '',
            estimatedHour: '',
            estimatedMinute: '',
            activeHour: '',
            activeMinute: '',
            status: '',
            remarks: ''
        };
        let project: Project = {
            name: '',
            tasks: [task]
        };
        this.projects.push(project);
    }

    public addEmptyTask(index: number): void {
        let task: Task = {
            taskName: '',
            estimatedHour: '',
            estimatedMinute: '',
            activeHour: '',
            activeMinute: '',
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

    public openPreviewModal(): void {
        this.saveNameToLocalStorage();
        this.saveTaskDataToLocalStorage();
        const modalRef = this.modal.open(PreviewModalComponent, {size: 'xl', centered: true});
        modalRef.componentInstance.projects = this.projects;
    }

    public saveData(): void {
        this.saveNameToLocalStorage();
        this.saveTaskDataToLocalStorage();
    }

    public clearTasks(): void {
        if (confirm('Are you sure you want to clear tasks?')) {
            this.storageService.removeItem(this.PROJECT_KEY);
            this.projects = [];
        }
    }

    public clearAllStorageData(): void {
        if (confirm('Are you sure you want to clear all data?')) {
            this.storageService.clear();
            this.clearAllData();
        }
    }

    public clearAllData(): void {
        this.username = '';
        this.projects = [];
        this.addEmptyProject();
    }

    public saveNameToLocalStorage(): void {
        if (this.username != '') {
            this.storageService.setItem(this.USERNAME_KEY, this.username);
        }
    }

    public saveTaskDataToLocalStorage(): void {
        if (this.projects.length > 0) {
            let jsonStr = JSON.stringify(this.projects);
            this.storageService.setItem(this.PROJECT_KEY, jsonStr);
        }
    }

    public getUsernameFromStorage(): void {
        this.username = this.storageService.getItem(this.USERNAME_KEY);
    }

    public getProjects(): void {
        let projectsJsonStr = this.storageService.getItem(this.PROJECT_KEY);
        try {
            this.projects = JSON.parse(projectsJsonStr);
        } catch (error) {
            console.error("Error in getting projects from storage");
            this.addEmptyProject();
        }
    }

    public getCurrentDate(): number {
        return Date.now();
    }
}
