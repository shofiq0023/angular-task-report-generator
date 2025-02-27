import {Component, Input} from '@angular/core';
import {Project} from '../../../models/project';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {DatePipe} from '@angular/common';

@Component({
  selector: 'app-preview-modal',
    imports: [
        DatePipe
    ],
  templateUrl: './preview-modal.component.html',
  styleUrl: './preview-modal.component.css'
})
export class PreviewModalComponent {
    @Input() projects! : Project[];

    public constructor(public activeModal: NgbActiveModal) {}

    public getUsername() : string {
        // TODO: Get username from localStorage
        return "Shofiqul Islam";
    }

    public getCurrentDate() {
        return Date.now();
    }

    public getProjectIdFromProjectName(projectName: string): string {
        return projectName.toLowerCase().replace(/\s+/g, '_');
    }

    public generateSingleImageAndDownload(): void {
        // TODO: Generate single image
    }

    public generateMultipleImageAndDownloadAsZip(): void {

    }
}
