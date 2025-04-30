import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbCollapseModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgScrollbarModule } from 'ngx-scrollbar';


@Component({
  selector: 'company-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule,  NgbModule, NgScrollbarModule, NgbCollapseModule],
  templateUrl: './company-edit.component.html',
  styleUrls: ['./company-edit.component.scss']
})
export default class CompanyEditComponent implements OnInit {

  options: boolean = false;
  
  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }
}
