import {Component, ElementRef, Input, QueryList, signal, ViewChild, ViewChildren, WritableSignal} from '@angular/core';
import {Project} from '../../../models/project';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {DatePipe} from '@angular/common';
import {LocalStorageService} from '../../../services/local-storage.service';
import html2canvas from 'html2canvas';
import JSZip from 'jszip';
import {saveAs} from 'file-saver';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {faCommentNodes, faCopy, faFileArrowDown, faFileZipper, faXmark} from '@fortawesome/free-solid-svg-icons';
import {Task} from '../../../models/task';

@Component({
    selector: 'app-preview-modal',
    imports: [FontAwesomeModule, DatePipe],
    templateUrl: './preview-modal.component.html',
    styleUrl: './preview-modal.component.css'
})
export class PreviewModalComponent {
    private USERNAME_KEY = 'username';
    @Input() projects!: Project[];

    @ViewChild('projectTableContainer', {static: true}) projectTableContainer!: ElementRef;
    @ViewChildren('projectTables') projectTables!: QueryList<ElementRef>;

    // FontAwesome icon definition
    public crossIcon = faXmark;
    public fileDownloadIcon = faFileArrowDown;
    public fileZipIcon = faFileZipper;
    public copyIcon = faCopy;
    public promptIcon = faCommentNodes;

    public loading: WritableSignal<boolean> = signal(false);
    public loadingImageCopying: WritableSignal<boolean> = signal(false);
    public loadingPromptGeneration: WritableSignal<boolean> = signal(false);

    public readonly currentDate: number = Date.now();

    public constructor(public activeModal: NgbActiveModal, private storageService: LocalStorageService) {
    }

    public getUsername(): string {
        return this.storageService.getItem(this.USERNAME_KEY);
    }

    public getCurrentDate() {
        return this.currentDate;
    }

    public getProjectIdFromProjectName(projectName: string): string {
        return projectName.toLowerCase().replace(/\s+/g, '_');
    }

    public generateSingleImageAndDownload(): void {
        this.loading.set(true);
        html2canvas(this.projectTableContainer.nativeElement).then(canvas => {
            const image = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = image;
            link.download = `${this.generateImageName()}.png`;
            link.click();
            this.loading.set(false);

            this.copyImageToClipboard(canvas);
        });
    }

    public generateSingleImageAndCopyToClipboard(): void {
        this.loadingImageCopying.set(true);
        html2canvas(this.projectTableContainer.nativeElement).then(canvas => {
            this.copyImageToClipboard(canvas);
        });
    }

    private copyImageToClipboard(canvas: HTMLCanvasElement): void {
        this.loadingImageCopying.set(false);
        canvas.toBlob(blob => {
            if (blob != null) {
                const item = new ClipboardItem({'image/png': blob});
                navigator.clipboard.write([item]).catch(err => console.error('Failed to copy image:', err));
            }
        });
    }

    private generateImageName(): string {
        let username = this.getUsername();
        let formattedUsername = this.getUnderscoreStr(username);
        let currentDateTimeStr = this.getCurrentDateTimeStr();

        return `${formattedUsername}_${currentDateTimeStr}`;
    }

    private generateImageNameWithProjectName(projectName: string): string {
        let username = this.getUsername();
        let formattedProjectName = this.getUnderscoreStr(projectName);
        let formattedUsername = this.getUnderscoreStr(username);
        let currentDateTimeStr = this.getCurrentDateTimeStr();

        return `${formattedUsername}_${formattedProjectName}_${currentDateTimeStr}`;
    }

    private getCurrentDateTimeStr(): string {
        let now = new Date();

        let dd = String(now.getDate()).padStart(2, '0');
        let MM = String(now.getMonth() + 1).padStart(2, '0');
        let yyyy = now.getFullYear();
        let hh = String(now.getHours()).padStart(2, '0');
        let mm = String(now.getMinutes()).padStart(2, '0');

        return `${dd}_${MM}_${yyyy}_${hh}_${mm}`;
    }

    public async generateMultipleImageAndDownloadAsZip(): Promise<void> {
        this.loading.set(true);
        const zip = new JSZip();
        const tableElements = this.projectTables.toArray();

        for (let i = 0; i < tableElements.length; i++) {
            const table = tableElements[i].nativeElement;
            const canvas = await html2canvas(table);
            const image = canvas.toDataURL('image/png');
            const projectName = this.projects[i].name;
            zip.file(`${this.generateImageNameWithProjectName(projectName)}.png`, image.split(',')[1], {base64: true});
        }

        zip.generateAsync({type: 'blob'}).then(content => {
            saveAs(content, `tasks_${this.getCurrentDateTimeStr()}.zip`);
            this.loading.set(false);
        });
    }

    private getUnderscoreStr(username: string): string {
        return username.toLowerCase().replace(/ /g, "_");
    }

    public notNullAndNotEmpty(data: string | number | null): boolean {
        return data != null && data != '';
    }

    public copyPromptForReportGeneration(): void {
        this.loadingPromptGeneration.set(true);

        let finishedProject: boolean = this.projectHasActiveTimes();
        let promptText: string = this.generatePromptText(finishedProject);
        this.copyPromptTextToClipboard(promptText);
    }

    private projectHasActiveTimes(): boolean {
        for (let i = 0; i < this.projects.length; i++) {
            let project: Project = this.projects[i];

            for (let j = 0; j < project.tasks.length; j++) {
                let task: Task = project.tasks[j];

                if (this.taskHasActiveTimes(task)) {
                    return true;
                }
            }
        }

        return false;
    }

    private generatePromptText(finishedProject: boolean): string {
        let mainPrompt = `Based on the provided JSON data, generate a single comprehensive ${this.getTaskReportType(finishedProject)} report. Generate a markdown file`;
        let template = "Use the provided template and generate the report in the same structure.";
        let note = `Note: The username will be ${this.getUsername()} and the file name (case sensitive) will be "${this.getTaskReportType(finishedProject)} Task Report (Projects name) (MMM dd, yyyy) - ${this.getUsername()}"`;

        let jsonHeading = `// Json Data: `;
        let jsonData = JSON.stringify(this.projects);
        return `${mainPrompt}\n${note}\n${template}\n${jsonHeading}\n${jsonData}`;
    }

    private getTaskReportType(finishedProject: boolean): string {
        if (finishedProject) {
            return 'Daily Day Ending';

        } else {
            return 'Daily Day Beginning';

        }
    }

    private copyPromptTextToClipboard(promptText: string) {
        navigator.clipboard.writeText(promptText)
            .then(() => {
                this.loadingPromptGeneration.set(false);
            })
            .catch(err => {
                console.error(err);
                this.loadingPromptGeneration.set(false);
            });
    }

    private taskHasActiveTimes(task: Task) {
        return task.activeMinute !== '' && task.activeMinute !== null || task.activeHour !== '' && task.activeHour !== null;
    }
}
