import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FilterService } from '../filter.service';
import {environment} from './../../environments/environment'

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.css']
})
export class SideBarComponent implements OnInit {

  public datastructures;
  public changed = false;
  
  public DS = {};


  constructor(private http:HttpClient, private _filter:FilterService) { }


  selectChangeHandler(event: any){
    console.log("Event triggered")
    let datastructure_id = event.value;
    let datastructure_agency_element = event.source.options._results;
    let datastructure_agency;
    for(let option of datastructure_agency_element){
      if(option["selected"] == true){
        datastructure_agency = option._element.nativeElement.getAttribute('agency_id');
      }
    }
    if(datastructure_id !== "null"){this.changed = true;}
    if(datastructure_id == "null"){this.changed = false;}
    this.DS = {
      "datastructure_id" : datastructure_id,
      "datastructure_agency" : datastructure_agency
    }
    this._filter.setDatastructure(this.DS);
    this._filter.changeMessage(this.DS);
  }

  ngOnInit() {
    let resp = this.http.get(`${environment.HostDomain}/UNICEF/v2/Datastructure`);
    resp.subscribe((data) => {
      this.datastructures = data;
      console.log(this.datastructures);
    }); 
  }

}
