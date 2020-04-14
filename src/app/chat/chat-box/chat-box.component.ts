import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import {SocketService} from './../../socket.service';
import {AppService} from './../../app.service';

import {Router, Routes} from '@angular/router';
import { Cookie} from 'ng2-cookies/ng2-cookies';
import {ToastrService} from 'ngx-toastr'
import { HttpParams,HttpClient} from '@angular/common/http'
import {Observable}from 'rxjs/Observable';


@Component({
  selector: 'app-chat-box',
  templateUrl: './chat-box.component.html',
  styleUrls: ['./chat-box.component.css'],
  providers:[SocketService,AppService]
})
export class ChatBoxComponent implements OnInit 
{
  @ViewChild('scrollMe',{read:ElementRef})
  public scrollMe: ElementRef;
  public authToken:any;//to store the authToken
  public userInfo:any;//to store the local userInfo
  public receiverId:any;//stored in the cookie
  public receiverName:any;//stored in the cookie
  public messageText:any;
  public userList:any=[];//the list of online users
  public disconnectedSocket:boolean;//changes vaue depending on the users current status[online(false) or offline(true)]
  
  public scrollToChatTop:any;
  public messageList: any=[]; //stores the current message list display in chat box 
  public pageValue:number=0;
  public loadingPreviousChat:boolean=false;
  public unseen:any;

  constructor(public appService:AppService,public socketService:SocketService, public toastr:ToastrService,public router:Router,public http:HttpParams) 
  { 
    this.receiverId=Cookie.get('receiverId');
    this.receiverName=Cookie.get('receiverName');
  }
  ngOnInit(): void 
  {
    this.authToken=Cookie.get('authToken');
    this.userInfo=this.appService.getUserInfoFromLocalStorage();
    this.checkStatus();
    this.verifyUserConfirmation();
    this.getOnlineUserList();
    this.getMessageFromUser();
  }
  public checkStatus: any = () => 
  {
    if (Cookie.get('authtoken') === undefined || Cookie.get('authtoken') === '' || Cookie.get('authtoken') === null) 
    {
      this.router.navigate(['/']);
      return false;
    }
    else 
    {
      return true;
    }
  } // end checkStatus
  public verifyUserConfirmation: any = () => 
  {
    this.socketService.verifyUser().subscribe((data) => 
    {     this.disconnectedSocket = false;
          this.socketService.setUser(this.authToken);
          this.getOnlineUserList();
    });
  }
  public getOnlineUserList :any =()=>
  {
    this.socketService.onlineUserList().subscribe((userList) => 
    {
      this.userList = [];
      for (let x in userList) 
      {
        let temp = { 'userId': x, 'name': userList[x], 'unread': 0, 'chatting': false };//sending userid,name,unread,chatting
        this.userList.push(temp);          
      }
      console.log(this.userList);  
    }); // end online-user-list
  }
  
  public sendMessageUsingKeyPress: any=(event:any)=>{
    if(event.keyCode===13)//13 is the keycode of enterz
    {
      this.sendMessage();
    }
  }
  public sendMessage:any=()=>{
    if(this.messageText){
      let chatMsgObject ={
        senderName:this.userInfo.firstName+" "+this.userInfo.lastName,
        senderId:this.userInfo.userId,
        receiverName:Cookie.get('receiverName'),
        receiverId:Cookie.get('receiverId'),
        message:this.messageText,
        createdOn:new Date()
      }
      console.log(chatMsgObject);
      this.socketService.SendChatMessage(chatMsgObject)
      this.pushToChatWindow(chatMsgObject);
    }
    else{
      this.toastr.warning('text message cannot be empty')
    }
  }
  public pushToChatWindow:any=(data)=>{
    this.messageText="";
    this.messageList.push(data);
    this.scrollToChatTop=false;
  }
  public getMessageFromUser:any=()=>{
    this.socketService.chatByUserId(this.userInfo.userId).subscribe((data)=>//using subscribe cause the method returns observable
    {
      (this.receiverId==data.senderId)?this.messageList.push(data):'';
      this.toastr.success(`${data.senderName} says: ${data.message  }`)
      this.scrollToChatTop=false;
    });
  }
  public userSelected:any=(id,name)=>{
    console.log("setting user as active"); 
    this.userList.map((user)=>//setting the user chatting to true
    {
      if(user.userId==id){
        user.chatting=true;
      }
      else{
        user.chatting=false;
      }
    })
    Cookie.set('receiverId',id)
    Cookie.set('receiverName',name);
    this.receiverName=name;
    this.receiverId=id;
    this.messageList=[];
    this.pageValue=0;

    let chatDetails={
      userId:this.userInfo.userId,
      senderId:id
    }
    this.socketService.markChatAsSeen(chatDetails);
    this.getPreviousChatWithUser()

  }
  
  public getPreviousChatWithUser:any=()=>{
    let previousData=(this.messageList.length>0?this.messageList.slice():[]);//make the message list empty
    this.socketService.getChat(this.userInfo.userId,this.receiverId,this.pageValue*10).subscribe((apiResponse)=>{
      console.log(apiResponse);
      if(apiResponse.status==200)
      {
        this.messageList=apiResponse.data.concat(previousData);
      }
      else
      {
        this.messageList=previousData;
        this.toastr.warning('no message available');
      }
      this.loadingPreviousChat=false;
    },(err)=>{
      this.toastr.error('some error occured')
    })
  }
  public markAsRead:any=()=>{
    
    this.socketService.getUnseenMessages(this.userInfo.userids).subscribe((apiResponse)=>{
      console.log(apiResponse);
      if(apiResponse.status==200)
      {
        
      }
      else
      {
        this.messageList=previousData;
        this.toastr.warning('no message available');
      }
      this.loadingPreviousChat=false;
    },(err)=>{
      this.toastr.error('some error occured')
    })
  }
  public loadEarlierPageOfChat:any=()=>{
    this.loadingPreviousChat=true;
    this.pageValue++;
    this.scrollToChatTop=true;

    this.getPreviousChatWithUser();
  }
  public logout:any=()=>
  {
    this.appService.logout().subscribe((apiResponse) => 
      {
        if (apiResponse.status === 200) 
        {
          console.log("logout called")
          Cookie.delete('authtoken');
          Cookie.delete('receiverId');
          Cookie.delete('receiverName');
          this.socketService.exitSocket()
          this.router.navigate(['/']);
        } 
        else 
        {
          this.toastr.error(apiResponse.message)
        } // end condition

      }, (err) => 
      {
        this.toastr.error('some error occured')
      });
  }
}
