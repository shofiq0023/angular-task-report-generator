import {Component, Input} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {FontAwesomeModule, IconDefinition} from '@fortawesome/angular-fontawesome';
import {faTriangleExclamation, faXmark} from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-confirm-modal',
    imports: [FontAwesomeModule],
    templateUrl: './confirm-modal.component.html',
    styleUrl: './confirm-modal.component.css'
})
export class ConfirmModalComponent {
    @Input() title: string = 'Are you sure?';
    @Input() message: string = 'This action cannot be undone.';
    @Input() confirmLabel: string = 'Confirm';
    @Input() confirmStyle: 'danger' | 'warning' = 'danger';

    public warningIcon: IconDefinition = faTriangleExclamation;
    public closeIcon: IconDefinition = faXmark;

    constructor(public activeModal: NgbActiveModal) {}
}
