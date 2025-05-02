import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-generic-table',
    templateUrl: './generic-table.component.html',
    styleUrls: ['./generic-table.component.css']
})
export class GenericTableComponent {
    @Input() columns: { key: string, label: string }[] = [];
    @Input() data: any[] = [];
}
