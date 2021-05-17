import { Component } from '@angular/core';
import {ShowHideService} from './show-hide.service' 
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'ngchart';
  Show_Bool = true;
  constructor(private _showhide_service: ShowHideService){
  }
  
  ToggleShow(){
    this.Show_Bool = !this.Show_Bool;
    this._showhide_service.changeMessage(this.Show_Bool)
  }

}
