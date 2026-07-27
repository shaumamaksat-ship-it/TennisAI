import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";

export default function LoginPage(){

const navigate=useNavigate();

const[email,setEmail]=useState("");
const[password,setPassword]=useState("");
const[message,setMessage]=useState("");

async function login(){

try{

const response=await fetch("http://localhost:5000/api/login",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
email,
password
})
});

const result=await response.json();

setMessage(result.message);

if(result.success){

localStorage.setItem("username",result.username);
localStorage.setItem("email",email);

setTimeout(()=>{
navigate("/profile");
},500);

}

}catch{

setMessage("Ошибка подключения к серверу");

}

}

return(

<div className="home">

<div
style={{
display:"flex",
flexDirection:"column",
justifyContent:"center",
alignItems:"center",
minHeight:"90vh"
}}
>

<div style={{fontSize:"70px"}}>🎾</div>

<h1>Вход</h1>

<p
style={{
opacity:.8,
marginBottom:"25px",
textAlign:"center"
}}
>
Войдите в TennisAI
</p>

<input
value={email}
onChange={(e)=>setEmail(e.target.value)}
type="email"
placeholder="Email"
style={{
width:"100%",
maxWidth:"350px",
padding:"16px",
marginBottom:"15px",
borderRadius:"12px",
border:"none"
}}
/>

<input
value={password}
onChange={(e)=>setPassword(e.target.value)}
type="password"
placeholder="Пароль"
style={{
width:"100%",
maxWidth:"350px",
padding:"16px",
marginBottom:"20px",
borderRadius:"12px",
border:"none"
}}
/>

<button
onClick={login}
style={{
width:"100%",
maxWidth:"350px",
padding:"16px",
background:"#18d96d",
color:"#081421",
border:"none",
borderRadius:"12px",
fontWeight:"800",
fontSize:"18px"
}}
>
🔐 Войти
</button>

<p
style={{
marginTop:"20px",
fontWeight:"700",
color:"#18d96d"
}}
>
{message}
</p>

</div>

</div>

);

}
