import { Component, OnInit } from '@angular/core';
import { GraphDataService } from '../graph-data.service';
import { Chart } from 'chart.js';
import {FormControl, FormGroup} from '@angular/forms';
import {ShowHideService} from '../show-hide.service'
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-my-radar-chart',
  templateUrl: './my-radar-chart.component.html',
  styleUrls: ['./my-radar-chart.component.css']
})
export class MyRadarChartComponent implements OnInit {

    //(Input) Dataflow that is holding all data
    public Dataflow;
    public Dimensions;
  
    //Chart variables
    chart;
    chartRender = false;
  
    //Select variables
    SelectFormGroup;
    ExpandFormGroup;
    ExpandSelectList;
    ExpandSelect = false;

    //ShowHide service variable holder
    ShowHide:boolean = true;
    ShowHide_Sub:Subscription;

    //'backgroundColor: ' + `rgba(${RandomColor[0]}, ${RandomColor[1]}, ${RandomColor[2]}, 0.5)`, 'borderColor: ' + `rgba(${RandomColor[0]}, ${RandomColor[1]}, ${RandomColor[2]}, 0.5)`
  constructor(private _graph_data:GraphDataService, private _showhide_service:ShowHideService) { 
    
    this.ShowHide_Sub = this._showhide_service.messageChanges$.subscribe((msg:boolean)=>{
      this.ShowHide = msg;
      console.log("MY BAR CHART")
      console.log(this.ShowHide);
    })
    
    this._graph_data.messageChanges$.subscribe((msg: object)=>{
      this.SelectFormGroup.reset();
      this.Dataflow = msg['data'];
      this.Dimensions = []; //Resetting values
      this.ExpandSelect = false; //Resetting values
      this.chartRender = false; //Resetting values
      this.Dimensions = this._graph_data.getSharedDimensions();
      console.log(this.Dataflow);
      this.Dimensions.push({id: 'TIME_PERIOD', name: 'Time Period'})
      this.InitDataflow()
    })
  }

  InitDataflow(){
    if(this.Dataflow !== undefined){
      
    }
  }

  ChangeOnModel(){
    console.log(this.SelectFormGroup.value)
    let Form_X = this.SelectFormGroup.value['Axis X'];
    let Form_Y = this.SelectFormGroup.value['Axis Y'];
    this.ExpandSelectList=[]; //Resetting values
    this.chartRender = false; //Resetting values
    if(!(Form_X == null || Object.keys(Form_X).length == 0) && !(Form_Y == null || Object.keys(Form_Y).length == 0)){ 
      this.ExpandFormGroup = new FormGroup({});
      console.log(this.Dimensions);
      for(let Dim of this.Dimensions){

        if(!(Dim['id'] == Form_X || Dim['id'] == Form_Y || Dim['id'] == 'OBS_VALUE')){
          console.log(Dim['id'])
          let Mapped = this.Dataflow.map(elem => elem[Dim['id']]);
          let unique_Mapped = Mapped.filter((c, index) => { return Mapped.indexOf(c) === index; });
          let Dimension_Object = {DimID: Dim['id'], DimOptions: unique_Mapped}
          this.ExpandSelectList.push(Dimension_Object);
          this.ExpandFormGroup.addControl(Dim['id'], new FormControl({}))
        }
        
      }
      console.log(this.ExpandFormGroup.controls);
      console.log(this.ExpandSelectList);
      this.ExpandSelect = true;
    }else{
      this.ExpandSelect = false;
    }
  }

  async ChangeOnExpand(){
    let SelectedExpand = {};
    this.chartRender = true; //Presets the boolean for true, if fails test doesnt render
    for(let dim in this.ExpandFormGroup.controls){
      let value = this.ExpandFormGroup.controls[dim].value;
      SelectedExpand[dim]= value;
      if(typeof(value) == 'object'){
        this.chartRender = false
      }
    }
    console.log("Chart render")
    console.log(this.chartRender);
    if(this.chartRender){
      let newDataset = this.Dataflow.filter(elem => {
        let BoolResult = true;
        for(let Dim in SelectedExpand){
          if(elem[Dim] !== SelectedExpand[Dim]){
            BoolResult = false;
          }
        }
        return BoolResult;
      })
      let NameX = this.SelectFormGroup.controls['Axis X'].value; //Var X
      let NameLabel = this.SelectFormGroup.controls['Axis Y'].value; //Label
      let VarX = newDataset.map(inst => inst[NameX]);
      let uniqueVarX = VarX.filter((c, index) => {return VarX.indexOf(c) === index;});
      uniqueVarX.sort();
      let OBS_VALUE = newDataset.map(dataset=> [dataset[NameX], dataset.OBS_VALUE, dataset[NameLabel]]);
      let FinalArray = [];
      for(let Obs in OBS_VALUE){
        let templateDataset = {};
        let RandomColor = await this.RandomColor(0,255);
        for(let Var_X in uniqueVarX){
          if(templateDataset['label'] == undefined){templateDataset['label'] = OBS_VALUE[Obs][2]}
          if(templateDataset['data'] == undefined){templateDataset['data'] = []}
          if(templateDataset['backgroundColor'] == undefined){templateDataset['backgroundColor'] = []}
          if(templateDataset['borderColor'] == undefined){templateDataset['borderColor'] = []}
          if(templateDataset['borderWidth'] == undefined){templateDataset['borderWidth'] = 0.2}
          if(templateDataset['pointBackgroundColor'] == undefined){templateDataset['pointBackgroundColor'] = []}
          if(templateDataset['pointBorderColor'] == undefined){templateDataset['pointBorderColor'] = []}
          if(templateDataset['pointHoverBackgroundColor'] == undefined){templateDataset['pointHoverBackgroundColor'] = []}
          if(templateDataset['pointHoverBorderColor'] == undefined){templateDataset['pointHoverBorderColor'] = []}
          if(templateDataset['pointBorderWidth'] == undefined){templateDataset['pointBorderWidth'] = []}

          if(OBS_VALUE[Obs][0] == uniqueVarX[Var_X]){
            templateDataset['data'].push(OBS_VALUE[Obs][1])
            templateDataset['backgroundColor'].push(`rgba(${RandomColor[0]}, ${RandomColor[1]}, ${RandomColor[2]}, 0.5)`);
            templateDataset['borderColor'].push(`rgb(${RandomColor[0]}, ${RandomColor[1]}, ${RandomColor[2]})`);
            templateDataset['pointBackgroundColor'].push(`rgba(${RandomColor[0]}, ${RandomColor[1]}, ${RandomColor[2]}, 0.5)`);
            templateDataset['pointBorderColor'].push(`#fff`);
            templateDataset['pointHoverBackgroundColor'].push(`#fff`);
            templateDataset['pointHoverBorderColor'].push(`rgba(${RandomColor[0]}, ${RandomColor[1]}, ${RandomColor[2]}, 0.5)`);
            templateDataset['pointBorderWidth'].push(`0.2`);

          }else{
            templateDataset['data'].push([]);
            templateDataset['backgroundColor'].push(`rgba(${RandomColor[0]}, ${RandomColor[1]}, ${RandomColor[2]}, 0.5)`);
            templateDataset['borderColor'].push(`rgb(${RandomColor[0]}, ${RandomColor[1]}, ${RandomColor[2]})`);
            templateDataset['pointBackgroundColor'].push(`rgba(${RandomColor[0]}, ${RandomColor[1]}, ${RandomColor[2]}, 0.5)`);
            templateDataset['pointBorderColor'].push(`#fff`);
            templateDataset['pointHoverBackgroundColor'].push(`#fff`);
            templateDataset['pointHoverBorderColor'].push(`rgba(${RandomColor[0]}, ${RandomColor[1]}, ${RandomColor[2]}, 0.5)`);
            templateDataset['pointBorderWidth'].push(`0.2`);
          }
        }
        FinalArray.push(templateDataset);
      }
      console.log("UniqueVarX")
      console.log(uniqueVarX);
      console.log("OBS_VALUE");
      console.log(OBS_VALUE);
      console.log("Final Array");
      console.log(FinalArray);
      
      if(this.chart !== undefined){
        this.chart.destroy();
      }
      console.log(this.chart);
        this.chart = new Chart('canvas', {
          type: 'radar',
          data: {
            labels: uniqueVarX,
            datasets: FinalArray
          },
          options: {
            elements: {
              line: {
                borderWidth: 3
              }
            }
          }
        })
        console.log(this.chart);
    }
  }

  RandomColor(Min_Range:number,Max_Range:number){
    return new Promise(resolve=>{
      var OutputArray = [];
      for(let i = 0; i < 3; i++){ //Number 3 for rgb(255,255,255) and rgba(255,255,255,0-1);
        let randomVal = (Math.random() * (Max_Range - Min_Range)) + Min_Range;
        let randomValRounded = Math.round(randomVal);
        OutputArray.push(randomValRounded);
      }
      console.log(OutputArray)
      resolve(OutputArray);
    })
  }

  ngOnInit() {
    this.SelectFormGroup = new FormGroup({})
    this.SelectFormGroup.addControl("Axis X", new FormControl({}))
    this.SelectFormGroup.addControl("Axis Y", new FormControl({}))
  }

}
