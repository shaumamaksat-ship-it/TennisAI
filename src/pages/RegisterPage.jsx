import { useState } from "react";
import "../styles/Home.css";

export default function RegisterPage(){

const [username,setUsername]=useState("");
const [email,setEmail]=useState("");
const [password,setPassword]=useState("");
const [message,setMessage]=useState("");

async function register(){

try{

const response=await fetch(
"http://localhost:5000/api/register",
{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
username,
email,
password
})
}
);

const result=await response.json();

setMessage(result.message);

}catch(e){

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

<div style={{fontSize:"70px"}}>
🎾
</div>

<h1>TennisAI</h1>

<p
style={{
opacity:.8,
textAlign:"center",
marginBottom:"30px"
}}
>
Создайте аккаунт
и начните пользоваться TennisAI
</p>

<input
value={username}
onChange={(e)=>setUsername(e.target.value)}
type="text"
placeholder="Имя пользователя"
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
onClick={register}
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
✅ Создать аккаунт
</button>

<p
style={{
marginTop:"20px",
color:"#18d96d",
fontWeight:"700",
textAlign:"center"
}}
>
{message}
</p>

</div>

</div>

);

}
