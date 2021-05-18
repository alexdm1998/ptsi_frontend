import { Injectable } from '@angular/core';
import {Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class GraphDataService {


  public Dataflow;
  public Dimensions;

  private messageSource = new Subject<object>();
  messageChanges$ = this.messageSource.asObservable();


  constructor() { }


  changeMessage(message: object){
    this.messageSource.next(message);
  }

  setSharedDataflow(Filtered_Dataflow){
    this.Dataflow = Filtered_Dataflow;
  }

  setSharedDimensions(Dimensions_Dataflow){
    this.Dimensions = Dimensions_Dataflow;
  }

  getSharedDimensions(){
    let newArray = []
    for(let dim of this.Dimensions){
      newArray.push(dim)
    }
    return newArray;
  }
}
