import React from 'react';
import { DataManager, UrlAdaptor } from '@syncfusion/ej2-data';
import { ScheduleComponent, ViewsDirective, ViewDirective, Day, Week, WorkWeek, Month, Agenda, Inject } from '@syncfusion/ej2-react-schedule';
import './App.css';

export default class App extends React.Component<{}, {}> {
  public scheduleObj: ScheduleComponent = new ScheduleComponent({});
  private dataManager: DataManager = new DataManager({
    url: 'http://localhost:5000/GetData',
    crudUrl: 'http://localhost:5000/BatchData',
    adaptor: new UrlAdaptor(),
    crossDomain: true
  });

  public render() {
    return (
      <div className="control-section">
        <div className="schedule-control">
          <ScheduleComponent 
            id="schedule" 
            ref={(schedule: ScheduleComponent | null) => { 
              this.scheduleObj = schedule!;
            }}
            height="550px"
            selectedDate={new Date(2026, 0, 1)} 
            currentView="Month" 
            eventSettings={{ dataSource: this.dataManager }}>
            <ViewsDirective>
              <ViewDirective option="Day" />
              <ViewDirective option="Week" />
              <ViewDirective option="WorkWeek" />
              <ViewDirective option="Month" />
              <ViewDirective option="Agenda" />
            </ViewsDirective>
            <Inject services={[Day, Week, WorkWeek, Month, Agenda]} />
          </ScheduleComponent>
        </div>
      </div>
    );
  }

}
