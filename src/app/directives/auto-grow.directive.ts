import { Directive, HostListener, ElementRef, AfterViewInit } from '@angular/core';

@Directive({
    selector: 'textarea[autoGrow]'
})
export class AutoGrowDirective implements AfterViewInit {

    constructor(private el: ElementRef<HTMLTextAreaElement>) {}

    @HostListener('input')
    onInput() {
        this.adjust();
    }

    ngAfterViewInit() {
        this.adjust(); // Adjust height when initial text is loaded
    }

    private adjust() {
        const textarea = this.el.nativeElement;
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
    }
}
