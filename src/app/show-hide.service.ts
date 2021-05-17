import { Injectable } from '@angular/core';
import {Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ShowHideService {

  ShowBool = true;

  private messageSource = new Subject<boolean>();
  messageChanges$ = this.messageSource.asObservable();

  constructor() { }

  changeMessage(message: boolean){
    this.messageSource.next(message);
  }
}
