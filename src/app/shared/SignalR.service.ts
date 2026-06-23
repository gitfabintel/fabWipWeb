import { Injectable } from '@angular/core';
import * as signalR from "@microsoft/signalr";  // or from "@microsoft/signalr" if you are using a new library
import { environment } from '../../environments/environment';
import { Subject } from 'rxjs';
import { Signalr } from '../shared/signalr.model';


@Injectable({
  providedIn: 'root'
})
export class SignalRService {
    newdata: any;
    private eventCallback = new Subject<string>(); 
    eventCallback$ = this.eventCallback.asObservable();
private hubConnection!: signalR.HubConnection
  public startConnection = () => {
    this.hubConnection = new signalR.HubConnectionBuilder()
    .withUrl(`${environment.apiUrl}/chart`,

    {
      skipNegotiation: true,
      transport: signalR.HttpTransportType.WebSockets
    })
       .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: retryContext => {
          // Custom retry logic: wait 2, 5, 10, 30 sec then stop
          const delays = [2000, 5000, 10000, 30000];
          return delays[retryContext.previousRetryCount] ?? null; // null = stop retrying
        }
      })
  .build();
    this.hubConnection
      .start()
      .then(() => console.log('Connection started'))
      .catch(err => console.log('Error while starting connection: ' + err))

       this.hubConnection.onreconnecting(error => {
      console.warn('SignalR reconnecting...', error);
    });

    this.hubConnection.onreconnected(connectionId => {
      console.log('SignalR reconnected. Connection ID:', connectionId);
    });

    this.hubConnection.onclose(error => {
      console.error('SignalR closed. Attempting to restart connection...');
      this.retryConnection();
    });
  }

    private retryConnection = () => {
    setTimeout(() => {
      this.startConnection(); // Try to restart connection
    }, 5000); // retry after 5 seconds
  };
  public addTransferChartDataListener = () => {
    return this.hubConnection.on('MessageNotificationAlert', (res:Signalr) => {
       this.newdata = res;
       this.eventCallback.next(this.newdata);
      // console.log(data);
      // return this.data;
      
    });
  }

  public broadcastChartData = (data:any) => {
    this.hubConnection.invoke('ReciveMessageNotificationAlert', data)
    .catch(err => console.error(err));
  }
}