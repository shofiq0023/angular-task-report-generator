import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {DatePipe} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FontAwesomeModule, IconDefinition} from '@fortawesome/angular-fontawesome';
import {faCircleCheck, faCircleXmark, faPencil} from '@fortawesome/free-solid-svg-icons';
import {UsernameService} from '../../services/username.service';

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
        if (this.usernameService.getUsernameFromStorage() == null) {
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
            // TODO: show a warning toast message for empty username
            return;
        }
        this.endEditingUsername();
        this.usernameService.saveName(this.username);
        // TODO: show a success toast message for username saving operation
    }


}
