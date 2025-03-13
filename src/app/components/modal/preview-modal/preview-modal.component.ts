import {Component, ElementRef, Input, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {Project} from '../../../models/project';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {DatePipe} from '@angular/common';
import {LocalStorageService} from '../../../services/local-storage.service';
import html2canvas from 'html2canvas';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

@Component({
    selector: 'app-preview-modal',
    imports: [
        DatePipe
    ],
    templateUrl: './preview-modal.component.html',
    styleUrl: './preview-modal.component.css'
})
export class PreviewModalComponent {
    private USERNAME_KEY = 'username';
    @Input() projects!: Project[];

    @ViewChild('projectTableContainer', {static: true}) projectTableContainer!: ElementRef;
    @ViewChildren('projectTables') projectTables!: QueryList<ElementRef>;

    public loading: boolean = false;

    public constructor(public activeModal: NgbActiveModal, private storageService: LocalStorageService) {}

    public getUsername(): string {
        return this.storageService.getItem(this.USERNAME_KEY);
    }

    public getCurrentDate() {
        return Date.now();
    }

    public getProjectIdFromProjectName(projectName: string): string {
        return projectName.toLowerCase().replace(/\s+/g, '_');
    }

    public generateSingleImageAndDownload(): void {
        this.loading = true;
        html2canvas(this.projectTableContainer.nativeElement).then(canvas => {
            const image = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = image;
            link.download = `${this.generateImageName()}.png`;
            link.click();
            this.loading = false;
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
        this.loading = true;
        const zip = new JSZip();
        const tableElements = this.projectTables.toArray();

        for (let i = 0; i < tableElements.length; i++) {
            const table = tableElements[i].nativeElement;
            const canvas = await html2canvas(table);
            const image = canvas.toDataURL('image/png');
            const projectName = this.projects[i].name;
            zip.file(`${this.generateImageNameWithProjectName(projectName)}.png`, image.split(',')[1], { base64: true });
        }

        zip.generateAsync({ type: 'blob' }).then(content => {
            saveAs(content, `tasks_${this.getCurrentDateTimeStr()}.zip`);
            this.loading = false;
        });
    }

    private getUnderscoreStr(username: string): string {
        return username.toLowerCase().replace(/ /g, "_");
    }
}
