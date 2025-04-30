import { Component, OnInit } from "@angular/core";


@Component({
  selector: 'bill-sidebar',
  standalone: true,  
  imports: [],
  templateUrl: './sidebar.component.html',
  styleUrls: ['sidebar.scss']
})

export class SidebarComponent implements OnInit {

  constructor() {}


  ngOnInit(): void {}
  
  onHomeClick() {    
  }

  // this is for eslint rule
  handleKeyDown(event: KeyboardEvent): void {
   
  }

  closeMenu() {
    if (document.querySelector('app-navigation.pcoded-navbar')!.classList.contains('mob-open')) {
      document.querySelector('app-navigation.pcoded-navbar')!.classList.remove('mob-open');
    }
  }


  // public method
  navMobClick() {}


}


