import {Injectable} from '@angular/core';
import {LocalStorageService} from './local-storage.service';

@Injectable({
    providedIn: 'root'
})
export class UsernameService {
    private USERNAME_KEY: string = 'username';

    constructor(private storageService: LocalStorageService) {
    }

    public saveName(username: string): void {
        if (username != '') {
            this.storageService.setItem(this.USERNAME_KEY, username);
        }
    }

    public getUsernameFromStorage(): string {
        return this.storageService.getItem(this.USERNAME_KEY);
    }
}
