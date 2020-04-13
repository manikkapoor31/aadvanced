import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';

import {RouterModule,Routes} from '@angular/router';
import { Observable} from 'rxjs/Observable';
import { Cookie} from 'ng2-cookies/ng2-cookies';

import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/toPromise';

import { HttpClient,HttpHeaders} from '@angular/common/http';
import { HttpErrorResponse, HttpParams} from '@angular/common/http';

@Injectable({ providedIn: 'root'})
export class SocketService 
{
  private url="https://chatapi.edwisor.com"
  private socket;

  constructor(public http: HttpParams) {
    this.socket=io(this.url);//socket connection or handshake or validation is taking place
   }

   public verifyUser=()=>{
     return Observable.create((observer)=>{
       this.socket.on ('verifyUser',(data)=>{
         observer.next(data);
       })

     })
   }
   public onlineUserList=()=>{
     return Observable.create((observer)=>{
       this.socket.on("disconnect",()=>{
         this.socket.on("online-user-list",(userList)=>{
          observer.next(userList);
         })
       })
     })
   }
   public disconnectedSocket=()=>{
     return Observable.create((observer)=>{
       this.socket.on("disconnect",()=>{
         observer.next();
       })
     })
   }
   public setUser=(authToken)=>{
     this.socket.emit("set-user",authToken);
   }
   public SendChatMessage=(chatMsgObject)=>{
     this.socket.emit('chat-msg',chatMsgObject);
   }
   public chatByUserId=(userId)=> //passing the userid cause we wnat to subscribe to our own messages
   {
     return Observable.create((observer)=>
     {
       this.socket.on(userId,(data)=>
       {
         observer.next(data);
       })
     })
   }
   public sendChatMessage=(chatMsgObject)=>
   {
     this.socket.emit('chat-msg',chatMsgObject);
   }
   public exitSocket=()=>
   {
     this.socket.disconnect();
   }
   /*public setUser =(authToken)=>{
     this.socket.emit("set-user",authToken);
   }*/
   public markChatAsSeen=(userDetails)=>{
     this.socket.emit('mark-chat-as-seen',userDetails);
   }
   public getChat(senderId,receiverId,skip):Observable<any>{
    return this.http.get(`${this.url}/api/v1/chat/get/for/user?senderId=${senderId}&receiverId=${receiverId}&skip=${skip}&authToken=${Cookie.get('authtoken')}`)
      .do(data => console.log('Data Received'))
      .catch(this.handleError);
  }
  public chatByUserID=(userId)=>{ //expecting it to have userId
    return Observable.create((observer)=>{ //listen to observable
      this.socket.on(userId,(data)=>//listening to the user id
      {
        observer.next(data);// and passing it to the observable
      })
    })
  }
  public handleError(err:HttpErrorResponse)  
  {
     let errorMessage="";
     if(err.error instanceof Error)
     {
       errorMessage=`an error occured:${err.error.message}`;
     }
     else
     {
       errorMessage=`server returnnend code:${err.status},error message is : ${err.error.message}`;
     }
     console.log(errorMessage);
     return Observable.throw(errorMessage);
   }//END handleError
}
