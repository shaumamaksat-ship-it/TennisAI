import {useEffect,useState} from "react";
import "./profile.css";

export default function Favorites(){

const[list,setList]=useState([]);

const username=localStorage.getItem("username");

useEffect(()=>{

fetch("http://127.0.0.1:5000/api/favorites/list/"+username)

.then(r=>r.json())

.then(data=>setList(data));

},[]);

return(

<div className="profile">

<div className="profileCard">

<h2>⭐ Избранные матчи</h2>

</div>

{

list.length===0?

<div className="profileCard">

Пока нет избранных матчей

</div>

:

list.map((m)=>(

<div
className="tournamentCard"
key={m.id}
>

<h3>

🎾 {m.player1}

</h3>

<h3>

🆚

</h3>

<h3>

🎾 {m.player2}

</h3>

<p>

🏆 {m.tournament}

</p>

</div>

))

}

</div>

);

}
