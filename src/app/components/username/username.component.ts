import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {DatePipe} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FontAwesomeModule, IconDefinition} from '@fortawesome/angular-fontawesome';
import {faCircleCheck, faCircleXmark, faPencil} from '@fortawesome/free-solid-svg-icons';
import {UsernameService} from '../../services/username.service';
import {toast} from 'ngx-sonner';

@Component({
    selector: 'app-username',
    imports: [
        DatePipe,
        ReactiveFormsModule,
        FontAwesomeModule,
        FormsModule
    ],
    templateUrl: './username.component.html',
    styleUrl: './username.component.css'
})
export class UsernameComponent implements OnInit {
    protected readonly toast = toast;
    @ViewChild('usernameInput') usernameInputEl!: ElementRef<HTMLInputElement>;

    private defaultUsername: string = "Username";

    // Fontawesome icons
    public pencilIcon: IconDefinition = faPencil;
    public checkIcon: IconDefinition = faCircleCheck;
    public crossIcon: IconDefinition = faCircleXmark;

    // Component's properties
    public username: string = this.defaultUsername;
    public currentDate: number = Date.now();
    public usernameEditing: boolean = false;

    constructor(private usernameService: UsernameService) {
    }

    ngOnInit(): void {
        if (this.usernameService.getUsernameFromStorage() == null || this.usernameService.getUsernameFromStorage() == "") {
            this.username = this.defaultUsername;
        } else {
            this.username = this.usernameService.getUsernameFromStorage();
        }
    }

    public startEditingUsername(): void {
        this.usernameEditing = true;

        setTimeout(() => {
            this.usernameInputEl.nativeElement.focus();
            this.usernameInputEl.nativeElement.select();
        });
    }

    public endEditingUsername(): void {
        this.usernameEditing = false;
    }

    public saveUsername(): void {
        let username = this.username;
        if (username === "") {
            toast.warning('Username cannot be empty!');
            return;
        }
        this.endEditingUsername();
        this.usernameService.saveName(this.username);
        toast.success('Username saved!');
    }


}
