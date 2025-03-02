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

    public constructor(public activeModal: NgbActiveModal, private storageService: LocalStorageService) {
    }

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
        html2canvas(this.projectTableContainer.nativeElement).then(canvas => {
            const image = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = image;
            link.download = `${this.getUsername()}_task.png`;
            link.click();
        });
    }

    public async generateMultipleImageAndDownloadAsZip(): Promise<void> {
        const zip = new JSZip();
        const tableElements = this.projectTables.toArray();

        for (let i = 0; i < tableElements.length; i++) {
            const table = tableElements[i].nativeElement;
            const canvas = await html2canvas(table);
            const image = canvas.toDataURL('image/png');
            zip.file(`project_${i + 1}.png`, image.split(',')[1], { base64: true });
        }

        zip.generateAsync({ type: 'blob' }).then(content => {
            saveAs(content, 'tasks.zip');
        });
    }
}
