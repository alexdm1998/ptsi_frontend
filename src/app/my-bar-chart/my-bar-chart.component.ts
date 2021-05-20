import { Component, OnDestroy, OnInit } from '@angular/core';
import { GraphDataService } from '../graph-data.service';
import { Chart } from 'chart.js';
import {FormControl, FormGroup} from '@angular/forms';
import {ShowHideService} from '../show-hide.service'
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-my-bar-chart',
  templateUrl: './my-bar-chart.component.html',
  styleUrls: ['./my-bar-chart.component.css']
})
export class MyBarChartComponent implements OnInit, OnDestroy{

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
    let Form_Y = this.SelectFormGroup.value['Label'];
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
      let NameLabel = this.SelectFormGroup.controls['Label'].value; //Label
      let VarX = newDataset.map(inst => inst[NameX]);
      let VarLabel = newDataset.map(data => data[NameLabel]);     
      
      let uniqueVarX = VarX.filter((c, index) => {return VarX.indexOf(c) === index;});
      let uniqueVarLabel = VarLabel.filter((c,index) => {return VarLabel.indexOf(c) === index});
      uniqueVarX.sort();

      let OBS_VALUE = newDataset.map(dataset=> [dataset[NameX], dataset.OBS_VALUE, dataset[NameLabel]]);
      let FinalArray = [];

      for(let LabelInst of uniqueVarLabel){
        let Instance_OBS = OBS_VALUE.filter(data => {return LabelInst == data[2]}) //data[2] is newDataset[NameLabel]
        console.log(Instance_OBS);
        let RandomColor = await this.RandomColor(0,255);
        let templateDataset = {};
        for(let ValX of uniqueVarX){
          if(templateDataset['label'] == undefined){templateDataset['label'] = Instance_OBS[0][2]} //Defines structure
          if(templateDataset['data'] == undefined){templateDataset['data'] = []}
          if(templateDataset['backgroundColor'] == undefined){templateDataset['backgroundColor'] = `rgba(${RandomColor[0]}, ${RandomColor[1]}, ${RandomColor[2]}, 0.5)`}
          if(templateDataset['borderColor'] == undefined){templateDataset['borderColor'] = `rgb(${RandomColor[0]}, ${RandomColor[1]}, ${RandomColor[2]})`}
          if(templateDataset['pointBackgroundColor'] == undefined){templateDataset['pointBackgroundColor'] = `rgb(${RandomColor[0]}, ${RandomColor[1]}, ${RandomColor[2]})`}
          let MatchedValue = Instance_OBS.filter(data => {return ValX == data[0]})
          if(MatchedValue.length > 0){
            templateDataset['data'].push(MatchedValue[0][1]);
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
          type: 'bar',
          data: {
            labels: uniqueVarX,
            datasets: FinalArray
          },
          options: {
            legend: {
              display: true
            },
            scales: {
              xAxes: [{
                display: true
              }],
              yAxes: [{
                display: true
              }]
            }
          }
        })

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
    this.SelectFormGroup.addControl("Label", new FormControl({}))
  }

  ngOnDestroy(){
    this.ShowHide_Sub.unsubscribe();
  }
}
