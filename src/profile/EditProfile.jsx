import { useState } from "react";
import "./profile.css";

export default function EditProfile(){

const[name,setName]=useState(localStorage.getItem("username")||"");
const[email,setEmail]=useState(localStorage.getItem("email")||"");
const[msg,setMsg]=useState("");

function save(){

localStorage.setItem("username",name);
localStorage.setItem("email",email);

setMsg("✅ Профиль успешно сохранён");

}

return(

<div className="profile">

<div className="profileCard">

<h2>✏️ Редактировать профиль</h2>

<br/>

<input
value={name}
onChange={(e)=>setName(e.target.value)}
placeholder="Имя"
style={{
width:"100%",
padding:"16px",
borderRadius:"12px",
border:"none",
marginBottom:"15px",
fontSize:"16px"
}}
/>

<input
value={email}
onChange={(e)=>setEmail(e.target.value)}
placeholder="Email"
style={{
width:"100%",
padding:"16px",
borderRadius:"12px",
border:"none",
marginBottom:"20px",
fontSize:"16px"
}}
/>

<button
onClick={save}
style={{
width:"100%",
padding:"16px",
background:"#18d96d",
color:"#081421",
border:"none",
borderRadius:"12px",
fontWeight:"800",
fontSize:"16px"
}}
>
💾 Сохранить
</button>

<p
style={{
marginTop:"20px",
color:"#18d96d",
fontWeight:"700"
}}
>
{msg}
</p>

</div>

</div>

);

}
