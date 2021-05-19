import { Component, OnInit } from '@angular/core';
import { GraphDataService } from '../graph-data.service';
import { Chart } from 'chart.js';
import {FormControl, FormGroup} from '@angular/forms';

@Component({
  selector: 'app-my-pie-chart',
  templateUrl: './my-pie-chart.component.html',
  styleUrls: ['./my-pie-chart.component.css']
})
export class MyPieChartComponent implements OnInit {

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

  constructor(private _graph_data:GraphDataService) { 
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

  ChangeOnExpand(){
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
      let NameX = this.SelectFormGroup.controls['Axis X'].value;
      let NameLabel = this.SelectFormGroup.controls['Axis Y'].value;
      let VarX = newDataset.map(inst => inst[NameX]);
      let uniqueVarX = VarX.filter((c, index) => {return VarX.indexOf(c) === index;});
      uniqueVarX.sort();
      let OBS_VALUE = newDataset.map(dataset=> [dataset[NameX], dataset.OBS_VALUE, dataset[NameLabel]]);
      let FinalArray = [];
      for(let Obs in OBS_VALUE){
        let templateDataset = {};
        for(let Var_X in uniqueVarX){
          if(templateDataset['label'] == undefined){templateDataset['label'] = OBS_VALUE[Obs][2]}
          if(templateDataset['data'] == undefined){templateDataset['data'] = []}
          if(OBS_VALUE[Obs][0] == uniqueVarX[Var_X]){
            templateDataset['data'].push(OBS_VALUE[Obs][1])
          }else{
            templateDataset['data'].push([]);
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
          type: 'pie',
          data: {
            labels: uniqueVarX, 
            datasets: FinalArray,
            backgroundColor: 'rgba(255, 99, 132, 0.2)'
          },
          options: {
            legend: {
              display: true
            },
          }
        })

    }
  }

  ngOnInit() {
    this.SelectFormGroup = new FormGroup({})
    this.SelectFormGroup.addControl("Axis X", new FormControl({}))
    this.SelectFormGroup.addControl("Axis Y", new FormControl({}))
  }

}
