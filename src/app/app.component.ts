import {Component, ElementRef, QueryList, ViewChildren} from '@angular/core';
import {
    faBroom,
    faCaretDown,
    faCaretUp,
    faCircleCheck,
    faCircleMinus,
    faCirclePlus,
    faCircleXmark,
    faEye,
    faFloppyDisk,
    faListCheck,
    faPencil,
    faTrash
} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeModule, IconDefinition} from '@fortawesome/angular-fontawesome';
import {Project} from './models/project';
import {Task} from './models/task';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {PreviewModalComponent} from './components/modal/preview-modal/preview-modal.component';
import {ConfirmModalComponent} from './components/modal/confirm-modal/confirm-modal.component';
import {FormsModule} from '@angular/forms';
import {LocalStorageService} from './services/local-storage.service';
import {NgClass} from '@angular/common';
import {UsernameComponent} from './components/username/username.component';
import {AutoGrowDirective} from './directives/auto-grow.directive';
import {NgxSonnerToaster, toast} from 'ngx-sonner';

@Component({
    selector: 'app-root',
    imports: [FontAwesomeModule, FormsModule, NgClass, UsernameComponent, AutoGrowDirective, NgxSonnerToaster],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})
export class AppComponent {
    protected readonly toast = toast;

    // Const
    private PROJECT_KEY: string = 'projects';
    private USERNAME_KEY: string = 'username';

    // FontAwesome icon definition
    public addIcon = faCirclePlus;
    public minusIcon = faCircleMinus;
    public saveIcon = faFloppyDisk;
    public clearIcon = faBroom;
    public deleteIcon = faTrash;
    public viewIcon = faEye;
    public caretUpIcon = faCaretUp;
    public caretDownIcon = faCaretDown;
    public pencilIcon = faPencil;
    public trashIcon = faTrash;
    public broomIcon = faBroom;
    public checkIcon: IconDefinition = faCircleCheck;
    public crossIcon: IconDefinition = faCircleXmark;
    public listIcon: IconDefinition = faListCheck;

    // Data
    public username: string = '';
    public projects: Project[] = [];

    // Animation state: animatingTasks[projectIndex][taskIndex] = 'up' | 'down' | null
    public animatingTasks: Map<string, 'up' | 'down'> = new Map();

    @ViewChildren('projectNameInput') projectNameInputs!: QueryList<ElementRef<HTMLInputElement>>;

    ngOnInit() {
        this.getProjects();
    }

    public constructor(private modal: NgbModal, private storageService: LocalStorageService) {}

    // Confirm helper
    private async openConfirm(
        title: string,
        message: string,
        confirmLabel: string = 'Confirm',
        confirmStyle: 'danger' | 'warning' = 'danger'
    ): Promise<boolean> {
        const modalRef = this.modal.open(ConfirmModalComponent, {centered: true, size: 'sm'});
        modalRef.componentInstance.title = title;
        modalRef.componentInstance.message = message;
        modalRef.componentInstance.confirmLabel = confirmLabel;
        modalRef.componentInstance.confirmStyle = confirmStyle;
        try {
            const result = await modalRef.result;
            return result === true;
        } catch {
            return false; // dismissed
        }
    }

    // Projects
    public addEmptyProject(): void {
        let task: Task = {
            taskName: '', estimatedHour: '', estimatedMinute: '',
            activeHour: '', activeMinute: '', status: '', remarks: ''
        };
        let project: Project = {name: 'Project Name', isEditing: false, tasks: [task]};
        this.projects.push(project);
    }

    public addEmptyTask(index: number): void {
        let task: Task = {
            taskName: '', estimatedHour: '', estimatedMinute: '',
            activeHour: '', activeMinute: '', status: '', remarks: ''
        };
        this.projects[index].tasks.push(task);
    }

    public startEditingProjectName(projectIndex: number): void {
        this.projects[projectIndex].isEditing = true;
        setTimeout(() => {
            const input = this.projectNameInputs.get(projectIndex);
            if (input) {
                input.nativeElement.focus();
                input.nativeElement.select();
            }
        });
    }

    public endEditingProjectName(projectIndex: number): void {
        this.projects[projectIndex].isEditing = false;
    }

    public async removeProject(index: number): Promise<void> {
        const confirmed = await this.openConfirm(
            'Delete project?',
            `"${this.projects[index].name}" and all its tasks will be permanently removed.`,
            'Delete project'
        );
        if (confirmed) this.projects.splice(index, 1);
    }

    public async removeTask(projectIndex: number, taskIndex: number): Promise<void> {
        const confirmed = await this.openConfirm(
            'Remove task?',
            'This task will be permanently removed.',
            'Remove task'
        );
        if (confirmed) this.projects[projectIndex].tasks.splice(taskIndex, 1);
    }

    public async clearTaskOfProject(projectIndex: number): Promise<void> {
        const confirmed = await this.openConfirm(
            'Clear all tasks?',
            `All tasks in "${this.projects[projectIndex].name}" will be removed.`,
            'Clear tasks',
            'warning'
        );
        if (confirmed) {
            this.projects[projectIndex].tasks = [];
            this.addEmptyTask(projectIndex);
        }
    }

    public openPreviewModal(): void {
        this.saveNameToLocalStorage();
        this.saveTaskDataToLocalStorage();
        const modalRef = this.modal.open(PreviewModalComponent, {size: 'xl', centered: true});
        modalRef.componentInstance.projects = this.projects;
    }

    public saveData(projectIndex?: number): void {
        if (projectIndex != undefined) this.endEditingProjectName(projectIndex);
        this.saveNameToLocalStorage();
        this.saveTaskDataToLocalStorage();
    }

    public async clearTasks(): Promise<void> {
        const confirmed = await this.openConfirm(
            'Clear all tasks?',
            'Tasks across all projects will be removed. Projects themselves will be kept.',
            'Clear tasks',
            'warning'
        );
        if (confirmed) {
            this.storageService.removeItem(this.PROJECT_KEY);
            this.projects = [];
            toast.success('All tasks have been cleared!');
        }
    }

    public async clearAllStorageData(): Promise<void> {
        const confirmed = await this.openConfirm(
            'Clear all data?',
            'Your username, all projects and all tasks will be permanently deleted.',
            'Clear everything'
        );
        if (confirmed) {
            this.storageService.clear();
            this.clearAllData();
            toast.warning('All data has been cleared!');
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
            toast.success('Username saved!');
        }
    }

    public saveTaskDataToLocalStorage(): void {
        if (this.projects.length > 0) {
            let jsonStr = JSON.stringify(this.projects);
            this.storageService.setItem(this.PROJECT_KEY, jsonStr);
            toast.success('Task data saved!');
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
            toast.error('Error in getting projects from storage!');
            this.addEmptyProject();
        }
    }

    // Task movement with animation
    private animKey(projectIndex: number, taskIndex: number): string {
        return `${projectIndex}-${taskIndex}`;
    }

    public getTaskAnimation(projectIndex: number, taskIndex: number): 'up' | 'down' | undefined {
        return this.animatingTasks.get(this.animKey(projectIndex, taskIndex));
    }

    public moveTaskUpward(projectIndex: number, taskIndex: number): void {
        if (taskIndex < 1) return;
        // Row moving up gets 'up', the displaced row gets 'down'
        this.triggerAnimation(projectIndex, taskIndex, 'up');
        this.triggerAnimation(projectIndex, taskIndex - 1, 'down');
        setTimeout(() => {
            const tasks = this.projects[projectIndex].tasks;
            this.moveTask(tasks, taskIndex, taskIndex - 1);
        }, 180);
    }

    public moveTaskDownward(projectIndex: number, taskIndex: number): void {
        const tasks = this.projects[projectIndex].tasks;
        if (taskIndex >= tasks.length - 1) return;
        this.triggerAnimation(projectIndex, taskIndex, 'down');
        this.triggerAnimation(projectIndex, taskIndex + 1, 'up');
        setTimeout(() => {
            this.moveTask(tasks, taskIndex, taskIndex + 1);
        }, 180);
    }

    private triggerAnimation(projectIndex: number, taskIndex: number, dir: 'up' | 'down'): void {
        const animDeleteTimeout = 250;
        const key = this.animKey(projectIndex, taskIndex);
        this.animatingTasks.set(key, dir);
        setTimeout(() => this.animatingTasks.delete(key), animDeleteTimeout);
    }

    private moveTask(tasks: Task[], fromIndex: number, toIndex: number): void {
        if (fromIndex < 0 || toIndex < 0 || fromIndex >= tasks.length || toIndex >= tasks.length) return;
        const [task] = tasks.splice(fromIndex, 1);
        tasks.splice(toIndex, 0, task);
    }
}
