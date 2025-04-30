import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgbCollapseModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgScrollbarModule } from 'ngx-scrollbar';


@Component({
  selector: 'company-read',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule,  NgbModule, NgScrollbarModule, NgbCollapseModule],
  templateUrl: './company-read.component.html',
  styleUrls: ['./company-read.component.scss']
})
export default class CompanyReadComponent implements OnInit{

  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }
}
