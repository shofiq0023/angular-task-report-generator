import {AfterViewInit, Directive, DoCheck, ElementRef, HostListener} from '@angular/core';

@Directive({
    selector: 'textarea[autoGrow]'
})
export class AutoGrowDirective implements AfterViewInit, DoCheck {

    private lastValue = '';

    constructor(private el: ElementRef<HTMLTextAreaElement>) {}

    @HostListener('input')
    onInput(): void {
        this.adjust();
    }

    ngAfterViewInit(): void {
        this.lastValue = this.el.nativeElement.value;
        setTimeout(() => this.adjust());
    }

    ngDoCheck(): void {
        const current = this.el.nativeElement.value;
        if (current !== this.lastValue) {
            this.lastValue = current;
            this.adjust();
        }
    }

    private adjust(): void {
        const textarea = this.el.nativeElement;
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
    }
}
