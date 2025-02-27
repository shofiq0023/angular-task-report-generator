import {Component, Input} from '@angular/core';
import {Project} from '../../../models/project';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {DatePipe} from '@angular/common';
import {LocalStorageService} from '../../../services/local-storage.service';

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
    @Input() projects! : Project[];

    public constructor(public activeModal: NgbActiveModal, private storageService: LocalStorageService) {}

    public getUsername() : string {
        return this.storageService.getItem(this.USERNAME_KEY);
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
        // TODO: Generate multiple image
        // TODO: Download generated images as ZIP file
    }
}
