import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'ngchart';
  
  constructor(){
  }
  Show_Bool = true;
  ToggleShow(){
    console.log(this.Show_Bool);
    this.Show_Bool = !this.Show_Bool;
  }

}
